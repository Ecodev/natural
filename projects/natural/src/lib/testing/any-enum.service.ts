import {type Observable, of} from 'rxjs';
import {type IEnum, NaturalEnumService} from '@ecodev/natural';
import {Service} from '@angular/core';

@Service()
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
