import {Pipe, type PipeTransform} from '@angular/core';
import {type ValidationErrors} from '@angular/forms';
import {urlPattern} from '../../../classes/validators';
import {formatIsoDate, formatSwissDate} from '../../../classes/utility';

/**
 * Return a single error message for the first found error, if any.
 *
 * Typical usage is without `@if`:
 *
 * ```html
 * <mat-form-field>
 *     <input matInput formControlName="name" />
 *     <mat-label i18n>Nom</mat-label>
 *     <mat-error>{{ form.get('name')?.errors | errorMessage }}</mat-error>
 * </mat-form-field>
 * ```
 *
 * If you need custom error messages, you can override, or defined new ones like that:
 *
 * ```html
 * <mat-form-field>
 *     <input matInput formControlName="name" />
 *     <mat-label i18n>Nom</mat-label>
 *     @if (form.get('name')?.hasError('required')) {
 *         <mat-error>Ce champ est requis parce qu'il est vraiment très important</mat-error>
 *     } @else {
 *         <mat-error>{{ form.get('name')?.errors | errorMessage }}</mat-error>
 *     }
 * </mat-form-field>
 * ```
 *
 * Supported validators are:
 *
 * - Angular
 *     - `Validators.max`
 *     - `Validators.maxlength`
 *     - `Validators.min`
 *     - `Validators.minlength`
 *     - `Validators.required`
 *     - `matDatepickerMin`
 *     - `matDatepickerMax`
 * - Natural
 *     - `available`
 *     - `decimal`
 *     - `deliverableEmail`
 *     - `greaterThan`
 *     - `integer`
 *     - `money` (also covers `signedMoney` and `unsignedMoney`)
 *     - `nfcCardHex`
 *     - `time`
 *     - `unique`
 *     - `url`
 * - Others, that live in individual projects, but we exceptionally support here
 *     - `iban`
 *     - `validateCity`
 *
 * @param unit is used to build the message for the following validators: `min`, `max`, `greaterThan`
 */
@Pipe({
    name: 'errorMessage',
})
export class NaturalErrorMessagePipe implements PipeTransform {
    public transform(errors: ValidationErrors | null | undefined, unit = ''): string {
        if (!errors) {
            return '';
        }

        if (unit) {
            unit = ` ${unit}`;
        }

        if (errors.required) {
            return $localize`Requis`;
        } else if (errors.minlength) {
            return $localize`Minimum ${errors.minlength.requiredLength} caractères`;
        } else if (errors.maxlength) {
            return $localize`Maximum ${errors.maxlength.requiredLength} caractères`;
        } else if (errors.integer) {
            return $localize`Doit être un nombre entier`;
        } else if (errors.money) {
            return $localize`Le montant doit être un nombre avec un maximum de deux décimales`;
        } else if (errors.email) {
            return $localize`Adresse email invalide`;
        } else if (errors.iban) {
            return $localize`IBAN invalide`;
        } else if (errors.min) {
            return $localize`Doit être plus grand ou égal à ${errors.min.min}${unit}`;
        } else if (errors.max) {
            return $localize`Doit être plus petit ou égal à ${errors.max.max}${unit}`;
        } else if (errors.greaterThan) {
            return $localize`Doit être plus grand que ${errors.greaterThan.greaterThan}${unit}`;
        } else if (errors.matDatepickerMin) {
            const min = formatIsoDate(errors.matDatepickerMin.min as Date);
            const date = new Date();
            const today = formatIsoDate(date);

            if (min === today) {
                return $localize`Ne doit pas être dans le passé`;
            }

            date.setDate(date.getDate() + 1);
            const tomorrow = formatIsoDate(date);
            if (min === tomorrow) {
                return $localize`Doit être dans le futur`;
            } else {
                return $localize`Doit être plus grand ou égal à ${formatSwissDate(errors.matDatepickerMin.min)}`;
            }
        } else if (errors.matDatepickerMax) {
            const max = formatIsoDate(errors.matDatepickerMax.max as Date);
            const date = new Date();
            const today = formatIsoDate(date);

            if (max === today) {
                return $localize`Ne doit pas être dans le futur`;
            }

            date.setDate(date.getDate() - 1);
            const yesterday = formatIsoDate(date);
            if (max === yesterday) {
                return $localize`Doit être dans le passé`;
            } else {
                return $localize`Doit être plus petit ou égal à ${formatSwissDate(errors.matDatepickerMax.max)}`;
            }
        } else if (errors.notCity) {
            return $localize`Veuillez choisir une ville de la liste`;
        } else if (errors.decimal) {
            return $localize`Maximum de ${errors.decimal} décimales`;
        } else if (errors.duplicateValue) {
            return $localize`N'est pas unique`;
        } else if (errors.available) {
            return $localize`N'est pas disponible`;
        } else if (errors.time) {
            return errors.time;
        } else if (errors.nfcCardHex) {
            return errors.nfcCardHex;
        } else if (errors.pattern?.requiredPattern === urlPattern) {
            return $localize`URL invalide`;
        }

        return '';
    }
}
