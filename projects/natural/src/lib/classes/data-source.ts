/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */

import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {Literal} from '../types/types';

// @formatter:off
export type NavigableItem<T> = T & {
    hasNavigation?: boolean;
};
// @formatter:on

export interface PaginatedData<T> {
    items: NavigableItem<T>[];
    offset?: number;
    pageSize: number;
    pageIndex: number;
    length: number;
}

/**
 * A NaturalDataSource will connect immediately, in order to know as soon as possible if
 * we need to show a template at all (as seen in my-ichtus)
 *
 * It also allow some extra data manipulation
 */
export class NaturalDataSource<T extends Literal = Literal> extends DataSource<T> {
    protected ngUnsubscribe = new Subject<void>();

    private readonly internalData: BehaviorSubject<PaginatedData<T> | null>;

    constructor(value: Observable<PaginatedData<T>> | PaginatedData<T>) {
        super();

        if (value instanceof Observable) {
            this.internalData = new BehaviorSubject<PaginatedData<T> | null>(null);
            value.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => (this.data = res));
        } else {
            this.internalData = new BehaviorSubject<PaginatedData<T>>(value);
        }
    }

    get internalDataObservable(): Observable<PaginatedData<T> | null> {
        return this.internalData;
    }

    /**
     * Array of data that should be rendered by the table, where each object represents one row.
     */
    get data(): PaginatedData<NavigableItem<T>> | null {
        return this.internalData.value;
    }

    set data(data: PaginatedData<NavigableItem<T>> | null) {
        this.internalData.next(data);
    }

    public connect(): Observable<NavigableItem<T>[]> {
        return this.internalData.pipe(
            takeUntil(this.ngUnsubscribe),
            map(data => (data ? data.items : [])),
        );
    }

    public disconnect(): void {
        this.ngUnsubscribe.next(); // required or complete() will not emit
        this.ngUnsubscribe.complete(); // unsubscribe everybody
    }

    public push(item: NavigableItem<T>): void {
        if (!this.data) {
            return;
        }

        const fullList = this.data.items;
        fullList.push(item);
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});
    }

    public pop(): NavigableItem<T> | undefined {
        if (!this.data) {
            return;
        }

        const fullList = this.data.items;
        const removedElement = fullList.pop();
        this.data = Object.assign(this.data, {items: fullList, length: fullList.length});

        return removedElement;
    }

    public remove(item: NavigableItem<T>): void {
        if (!this.data) {
            return;
        }

        const index = this.data.items.indexOf(item);
        if (index > -1) {
            this.data.items.splice(index, 1);
            this.data.length--;
            this.data = this.data;
        }
    }

    public patchItemAt(index: number, value: Partial<NavigableItem<T>>) {
        if (!this.data) {
            return;
        }

        const item = this.data.items[index];
        this.patchItem(item, value);
    }

    public patchItem(item: NavigableItem<T>, value: Partial<NavigableItem<T>>) {
        Object.assign(item, value);
    }
}
