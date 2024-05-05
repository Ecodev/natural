/**
 * Resolves accept key "model" to interface existing COARD components or any other key for other components.
 * When model is provided, the other resolved data are dismissed (actually there is no case where we need it)
 */
import {inject} from '@angular/core';
import {NaturalPanelsRouterRule} from '@ecodev/natural';
import {Observable, of} from 'rxjs';
import {Item, ItemService} from '../../projects/natural/src/lib/testing/item.service';
import {AnyComponent} from './shared/components/any/any.component';

function resolveMy(): Observable<Item> {
    const itemService = inject(ItemService);

    return of({
        ...itemService.getItem(),
        name: 'resolved',
        description: 'resolved description',
    });
}

export const panelsRoutes: NaturalPanelsRouterRule[] = [
    {
        path: 'panel/:param',
        component: AnyComponent,
        resolve: {foo: resolveMy},
    },
    {
        path: 'modelPanel/:param',
        component: AnyComponent,
        resolve: {
            model: route => inject(ItemService).resolve(route.params.param),
        },
    },
];
