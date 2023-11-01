import {Observable} from 'rxjs';
import {Item, ItemInput, ItemService} from './item.service';
import {inject} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';

/**
 * Resolve Item data for router and panels service
 */
export function resolveItem(route: ActivatedRouteSnapshot): Observable<Observable<Item | ItemInput>> {
    const itemService = inject(ItemService);
    console.warn('resolve Item');

    return itemService.resolve(route.params.id);
}
