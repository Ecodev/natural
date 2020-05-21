import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NaturalAbstractModelService } from '../services/abstract-model.service';
import { NaturalQueryVariablesManager, QueryVariables } from './query-variable-manager';

/**
 * Returns an async validator function that checks that the form control value is unique
 */
export function unique(
    fieldName: string,
    excludedId: string | null | undefined,
    modelService: NaturalAbstractModelService<any, any, any, any, any, any, any, any, any>,
): AsyncValidatorFn {

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

        if (!control.value || !control.dirty) {
            return of(null);
        }

        const condition = {};
        condition[fieldName] = {equal: {value: control.value}};

        if (excludedId) {
            condition['id'] = {equal: {value: excludedId, not: true}};
        }

        const variables: QueryVariables = {
            pagination: {pageIndex: 0, pageSize: 0},
            filter: {groups: [{conditions: [condition]}]},
        };

        const qvm = new NaturalQueryVariablesManager();
        qvm.set('variables', variables);

        return timer(500).pipe(switchMap(() => modelService.count(qvm).pipe(
            map(count => count > 0 ? {duplicateValue: count} : null),
        )));
    };
}

/**
 * Return all errors recursively for the given Form or control
 */
export function collectErrors(control: AbstractControl): ValidationErrors | null {
    let errors: ValidationErrors | null = null;
    if (control instanceof FormGroup || control instanceof FormArray) {
        errors = Object.entries(control.controls)
            .reduce((acc: ValidationErrors | null, [key, childControl]) => {
                    const childErrors = collectErrors(childControl);
                    if (childErrors) {
                        acc = {...acc, [key]: childErrors};
                    }
                    return acc;
                },
                null,
            );
    }

    if (!errors) {
        errors = control.errors;
    }

    return errors;
}

/**
 * Force validation of all form controls recursively.
 *
 * Recursively mark descending form tree as dirty and touched in order to show all invalid fields on demand.
 * Typically used when creating a new object and user clicked on create button but several fields were not
 * touched and are invalid.
 */
export function validateAllFormControls(control: AbstractControl): void {
    if (control instanceof FormControl) {
        control.markAsDirty({onlySelf: true});
        control.markAsTouched({onlySelf: true});
    } else if (control instanceof FormGroup || control instanceof FormArray) {
        for (const [, child] of Object.entries(control.controls)) {
            validateAllFormControls(child);
        }
    }
}
