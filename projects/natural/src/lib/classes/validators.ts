import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalQueryVariablesManager } from './query-variable-manager';

export class NaturalValidators {

    /**
     * Returns an async validator function that checks that the form control value is unique
     */
    public static unique(
        fieldName: string,
        modelService: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>): AsyncValidatorFn {

        const validator = (control: AbstractControl): Observable<ValidationErrors | null> => {

            const condition = {};

            if (control.value && control.dirty) {

                condition[fieldName] = {equal: {value: control.value}};
                const variables: any = {
                    pagination: {pageIndex: 0, pageSize: 0},
                    filter: {groups: [{conditions: [condition]}]},
                };

                const qvm = new NaturalQueryVariablesManager<any>();
                qvm.set('variables', variables);

                return modelService.count(qvm).pipe(
                    map((count: number) => {
                        return count > 0 ? {duplicateValue: count} : null;
                    }),
                );
            }

            return of(null);
        };
        return validator;
    }
}
