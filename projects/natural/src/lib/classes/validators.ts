import {
    AbstractControl,
    AsyncValidatorFn,
    FormArray,
    FormControlStatus,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import {Observable, of, timer} from 'rxjs';
import {filter, first, map, switchMap} from 'rxjs/operators';
import {NaturalQueryVariablesManager, QueryVariables} from './query-variable-manager';
import {validTlds} from './tld';
import {FilterGroupCondition} from '../modules/search/classes/graphql-doctrine.types';
import {UntypedModelService} from '../types/types';

function isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
}

/**
 * Returns an async validator function that checks that the form control value is unique
 */
export function unique(
    fieldName: string,
    excludedId: string | null | undefined,
    modelService: UntypedModelService,
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value || !control.dirty) {
            return of(null);
        }

        const condition: FilterGroupCondition = {};
        condition[fieldName] = {equal: {value: control.value}};

        if (excludedId) {
            condition.id = {equal: {value: excludedId, not: true}};
        }

        const variables: QueryVariables = {
            pagination: {pageIndex: 0, pageSize: 0},
            filter: {groups: [{conditions: [condition]}]},
        };

        const qvm = new NaturalQueryVariablesManager();
        qvm.set('variables', variables);

        return timer(500).pipe(
            switchMap(() =>
                modelService.count(qvm).pipe(
                    first(),
                    map(count => (count > 0 ? {duplicateValue: count} : null)),
                ),
            ),
        );
    };
}

/**
 * Returns an async validator function that checks that the form control value is available
 *
 * Similar to `unique` validator, but allows to use a custom query for when the client does
 * not have permissions for `modelService.count()`.
 */
export function available(
    getAvailableQuery: (value: string, excludedId: string | null) => Observable<boolean>,
    excludedId: string | null = null,
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value || !control.dirty) {
            return of(null);
        }

        return timer(500).pipe(
            switchMap(() =>
                getAvailableQuery(control.value, excludedId).pipe(
                    map(isAvailable => (isAvailable ? null : {available: true})),
                ),
            ),
        );
    };
}

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

// This is an approximation of RFC_5322 where the hostname:
//
// - is too strict because it rejects IP address
// - is too lax because it accepts pretty much anything else
//
// but the TLD will be validated against a whitelist so that should make the whole thing acceptable
const RFC_5322 = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[^@ ]+\.[^@]+$/u;

/**
 * Validate an email address according to RFC, and also that it is publicly deliverable (not "root@localhost" or "root@127.0.0.1")
 *
 * This is meant to replace **all** usages of Angular too permissive `Validators.email`
 */
export function deliverableEmail(control: AbstractControl): ValidationErrors | null {
    // don't validate empty values to allow optional controls
    const value = control.value;
    if (!value) {
        return null;
    }

    const error = {email: true};
    if (value.length > 254) {
        return error;
    }

    if (!RFC_5322.test(value)) {
        return error;
    }

    const tld = value.split('.').pop();
    if (!validTlds.includes(tld)) {
        return error;
    }

    return null;
}

const urlRegexp = /^https?:\/\/(?:[^.\s]+\.)+[^.\s]+$/;
export const urlPattern = urlRegexp.toString();

/**
 * Naive URL validator for "normal" web links, that is a bit too permissive
 *
 * - It enforces:
 *     - http/https protocol
 *     - one domain
 *     - one tld
 * - It allows:
 *     - any number of subdomains
 *     - any parameters
 *     - any fragments
 *     - any characters for any parts (does not conform to rfc1738)
 */
export const url = Validators.pattern(urlRegexp);

/**
 * Validates that the value is an integer (non-float)
 */
export function integer(control: AbstractControl): ValidationErrors | null {
    // Don't validate empty values to allow optional controls
    if (control.value === null || control.value === undefined || control.value === '') {
        return null;
    }

    return Number.isInteger(parseFloat(control.value)) ? null : {integer: true};
}

/**
 * Validate that the value is a decimal number with up to `scale` digits
 *
 * The error contains the expected scale, so that the error message can explain
 * it to the end-user.
 */
export function decimal(scale: number): ValidatorFn {
    const regExp = new RegExp(`^-?\\d+(\\.\\d{0,${scale}})?$`);
    return control => {
        // Don't validate empty values to allow optional controls
        if (control.value === null || control.value === undefined || control.value === '') {
            return null;
        }

        const value = '' + control.value;
        if (value.match(regExp)) {
            return null;
        }

        return {decimal: scale};
    };
}

/**
 * For internal use to avoid re-creating regexp on each call of `money`
 */
const twoDecimals = decimal(2);

/**
 * Validate that the value is an amount of money, meaning a number with at most 2 decimals
 */
export function money(control: AbstractControl): ValidationErrors | null {
    return twoDecimals(control) ? {money: true} : null;
}

/**
 * Validate that the number is strictly greater than given one.
 *
 * `Validators.min()` is "greater than or equal", but this one is strictly
 * "greater than".
 *
 * **SHOULD NOT USE IT**, instead consider using Angular's native `Validators.min()`.
 * Because you should also apply `[attr.min]="123"` in the template to have the browser
 * help the user. And that attribute spec defines that it is "greater or equal", which
 * contradicts this validator. So we cannot use this validator and have the best UX.
 */
export function greaterThan(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (isEmptyInputValue(control.value) || isEmptyInputValue(min)) {
            return null; // don't validate empty values to allow optional controls
        }
        const value = parseFloat(control.value);
        // Controls with NaN values after parsing should be treated as not having a
        // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
        return !isNaN(value) && value <= min ? {greaterThan: {greaterThan: min, actualValue: control.value}} : null;
    };
}

/**
 * Validate a 32 bits MiFare hexadecimal CSN
 */
export function nfcCardHex(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (value && !value.match(/^[0-9A-F]{2}:?[0-9A-F]{2}:?[0-9A-F]{2}:?[0-9A-F]{2}$/i)) {
        return {
            nfcCardHex: $localize`Doit être au format hexadécimal (A1:B2:C3:D4 ou A1B2C3D4)`,
        };
    }

    return null;
}

const invalidTime: ValidationErrors = {
    time: `L'heure doit être au format "14h35", "14:35" ou "14h".`,
};

// This pattern should be kept in sync with `\Ecodev\Felix\Api\Scalar\TimeType::parseValue()`
const timePattern = /^(?<hour>\d{1,2})(([h:]$)|([h:](?<minute>\d{1,2}))?$)/;

/**
 * Validate a time similar to "14h35", "14:35" or "14h".
 */
export function time(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (!value) {
        return null;
    } else if (typeof value !== 'string') {
        return invalidTime;
    }

    const match = timePattern.exec(value.trim());
    if (match?.groups && parseFloat(match.groups.hour) <= 24 && parseFloat(match.groups.minute ?? '0') <= 60) {
        return null;
    }

    return invalidTime;
}
