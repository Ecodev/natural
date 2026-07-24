import {Apollo} from 'apollo-angular';
import {DestroyRef} from '@angular/core';
import {ApolloClient} from '@apollo/client';
import {filter, map, MonoTypeOperatorFunction, Observable, OperatorFunction, take, takeUntil, tap, timer} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Behave like setTimeout(), but with a mandatory cancel mechanism.
 *
 * This is typically useful to replace setTimeout() in components where the callback
 * would crash if executed after the component destruction. That can easily happen
 * when the user navigates quickly between pages.
 *
 * Typical usage in a component would be:
 *
 * ```ts
 * cancellableTimeout(inject(DestroyRef)).subscribe(myCallback);
 * ```
 *
 * or
 *
 * ```ts
 * cancellableTimeout(this.ngUnsubscribe).subscribe(myCallback);
 * ```
 *
 * Instead of the more error-prone:
 *
 * ```ts
 * public foo(): void {
 *     this.timeout = setTimeout(myCallBack);
 * }
 *
 * public ngOnDestroy(): void {
 *     if (this.timeout) {
 *         clearTimeout(this.timeout);
 *         this.timeout = null;
 *      }
 * }
 * ```
 */
export function cancellableTimeout(canceller: Observable<unknown> | DestroyRef, milliSeconds = 0): Observable<void> {
    return timer(milliSeconds).pipe(
        take(1),
        canceller instanceof DestroyRef ? takeUntilDestroyed(canceller) : takeUntil(canceller),
        map(() => undefined),
    );
}

/**
 * For debugging purpose only, will dump in console everything that happen to
 * the observable
 */
export function debug<T>(debugName: string): MonoTypeOperatorFunction<T> {
    return tap<T>({
        subscribe: () => console.log('SUBSCRIBE', debugName),
        unsubscribe: () => console.log('UNSUBSCRIBE', debugName),
        next: value => console.log('NEXT', debugName, value),
        error: error => console.log('ERROR', debugName, error),
        complete: () => console.log('COMPLETE', debugName),
    });
}

/**
 * Filter emitted results to only receive results that are successful (`result.data !== undefined`).
 *
 * This is a small wrapper around rxjs `filter()` for convenience only.
 *
 * This should be entirely deleted once we adopt Apollo Client 4.2 modern signatures that provide the same convenience but through typing inference only.
 *
 * See https://github.com/the-guild-org/apollo-angular/issues/2429
 *
 * Usage:
 *
 * ```ts
 * apollo
 *   .query({
 *     query: myQuery,
 *   })
 *   .pipe(ignoreErrors())
 *   .subscribe(result => {
 *     // Do something with complete result
 *   });
 * ```
 */
export function ignoreErrors<TData>(): OperatorFunction<
    Apollo.QueryResult<TData>,
    ApolloClient.QueryResultMap<TData>['none']
> {
    return filter((result): result is ApolloClient.QueryResultMap<TData>['none'] => result.data !== undefined);
}
