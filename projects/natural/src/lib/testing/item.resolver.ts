import type {Observable} from 'rxjs';
import type {Item, ItemInput} from './item.service';
import { ItemService} from './item.service';
import {inject} from '@angular/core';
import type {ActivatedRouteSnapshot} from '@angular/router';

/**
 * Resolve Item data for router and panels service
 */
export function resolveItem(route: ActivatedRouteSnapshot): Observable<Observable<Item | ItemInput>> {
    const itemService = inject(ItemService);
    console.warn('resolve Item');

    return itemService.resolve(route.params.id);
}

export function resolveHardcodedItem(): Observable<Observable<Item | ItemInput>> {
    const itemService = inject(ItemService);
    console.warn('resolve hardcoded Item');

    return itemService.resolve('123');
}
