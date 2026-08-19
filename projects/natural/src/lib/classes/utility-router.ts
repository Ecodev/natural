import {type ActivatedRoute, NavigationEnd, NavigationStart, type Router} from '@angular/router';
import {filter, type Observable, switchMap, take} from 'rxjs';

/**
 * Emits whenever we use the browser Back / Forward button and we navigate to the same component but with different matrix parameters
 */
export function onHistoryEvent(router: Router, route: ActivatedRoute): Observable<NavigationEnd> {
    return router.events.pipe(
        filter(e => {
            const navigationUrlWithoutMatrixParameters =
                e instanceof NavigationStart && e.navigationTrigger === 'popstate'
                    ? e.url.replace(/;[^/]*$/, '')
                    : null;

            return navigationUrlWithoutMatrixParameters === currentComponentUrl(route);
        }),
        switchMap(() =>
            router.events.pipe(
                filter(e => e instanceof NavigationEnd),
                take(1),
            ),
        ),
    );
}

/**
 * Return the current component URL, without its matrix parameters, and without child routes.
 *
 * This should be used instead of `router.url`, because the current component is not necessarily the last one in the URL. Typically if a routed dialog is
 *
 * From `ListComponent`, on:
 *
 * ```
 * /parent;param1=value1/list;param2=value2/child;param3=value3
 * ```
 *
 * It will return:
 *
 * ```
 * /parent;param1=value1/list
 * ```
 */
export function currentComponentUrl(route: ActivatedRoute): string {
    const pathFromRoot = route.snapshot.pathFromRoot;
    const last = pathFromRoot.at(-1);
    const parts = pathFromRoot.flatMap(node =>
        node.url.map(segment => {
            // Append matrix parameters for this specific segment if it is not the last
            const matrixParams =
                node === last
                    ? ''
                    : Object.entries(segment.parameters)
                          .map(([key, value]) => `;${key}=${value}`)
                          .join('');

            return segment.path + matrixParams;
        }),
    );

    return '/' + parts.filter(p => p.length > 0).join('/');
}
