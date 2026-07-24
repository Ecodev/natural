import type {Observable} from 'rxjs';
import { of} from 'rxjs';
import type {IEnum} from '@ecodev/natural';
import { NaturalEnumService} from '@ecodev/natural';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AnyEnumService extends NaturalEnumService {
    public override get(): Observable<IEnum[]> {
        return of([
            {
                value: 'val1',
                name: 'name1',
            },
            {
                value: 'val2',
                name: 'name2',
            },
            {
                value: 'val3',
                name: 'name3',
            },
        ]);
    }
}
