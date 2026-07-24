import {Injectable} from '@angular/core';
import {type Observable, timer} from 'rxjs';
import {type PaginatedData} from '../classes/data-source';
import {type QueryVariables} from '../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {map} from 'rxjs/operators';
import {type Item} from './item.service';

function error(method: string): Observable<any> {
    return timer(1000).pipe(
        map(() => {
            throw new Error('ErrorService.' + method + ' error');
        }),
    );
}

@Injectable({
    providedIn: 'root',
})
export class ErrorService extends NaturalAbstractModelService<
    Item,
    {id: string},
    PaginatedData<Item>,
    QueryVariables,
    never,
    never,
    Record<string, never>,
    never,
    never,
    never
> {
    public constructor() {
        super('user', null, null, null, null, null);
    }

    public override watchAll(): Observable<PaginatedData<Item>> {
        return error('watchAll');
    }

    public override getAll(): Observable<PaginatedData<Item>> {
        return error('getAll');
    }

    public override getOne(): Observable<Item> {
        return error('getOne');
    }

    public override count(): Observable<number> {
        return error('count');
    }
}
