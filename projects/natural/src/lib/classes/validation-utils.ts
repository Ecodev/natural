import {
    type AbstractControl,
    FormArray,
    type FormControlStatus,
    FormGroup,
    type ValidationErrors,
} from '@angular/forms';
import {filter, first, type Observable, of} from 'rxjs';

/**
 * Return all errors recursively for the given Form or control
 */
export function collectErrors(control: AbstractControl<unknown>): ValidationErrors | null {
    let errors: ValidationErrors | null = null;
    if (control instanceof FormGroup || control instanceof FormArray) {
        errors = Object.entries(control.controls).reduce((acc: ValidationErrors | null, [key, childControl]) => {
            const childErrors = collectErrors(childControl);
            if (childErrors) {
                acc = {...acc, [key]: childErrors};
            }
            return acc;
        }, null);
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
export function validateAllFormControls(control: AbstractControl<unknown>): void {
    control.markAllAsDirty();
    control.markAllAsTouched();
}

function isValid(status: FormControlStatus): status is 'VALID' {
    return status === 'VALID';
}

/**
 * Emits exactly 0 or 1 time:
 *
 * - if the form is `VALID`, emits immediately
 * - if the form is `PENDING` emits if it changes from `PENDING` to `VALID`
 * - any other cases will **never** emit
 */
export function ifValid(control: AbstractControl): Observable<'VALID'> {
    const observable = control.pending ? control.statusChanges.pipe(first()) : of(control.status);

    return observable.pipe(filter(isValid));
}
