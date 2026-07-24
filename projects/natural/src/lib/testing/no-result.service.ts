import {Injectable} from '@angular/core';
import type {Observable} from 'rxjs';
import { of} from 'rxjs';
import type {PaginatedData} from '../classes/data-source';
import {delay} from 'rxjs/operators';
import type {Item} from './item.service';
import { ItemService} from './item.service';

/**
 * A service that has no items
 */
@Injectable({
    providedIn: 'root',
})
export class NoResultService extends ItemService {
    public override watchAll(): Observable<PaginatedData<Item>> {
        return of({
            items: [],
            length: 0,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public override getAll(): Observable<PaginatedData<Item>> {
        return of({
            items: [],
            length: 0,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public override count(): Observable<number> {
        return of(0).pipe(delay(500));
    }
}
