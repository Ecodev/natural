import {Pipe, type PipeTransform} from '@angular/core';
import {type ValidationErrors} from '@angular/forms';
import {formatIsoDate, formatSwissDate} from '../../../classes/utility';
import {factorToPercentage} from '../directives/percentage-input.directive';

/**
 * Return a single error message for the first found error, if any.
 *
 * `convertToPercentage` should be `true` for a field whose control holds
 * a factor (0.00-1.00) while its input shows a percentage (0-100%). So that
 * the message uses the same unit that was typed by the human (0-100%).
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
 * **Angular**:
 *
 *   - `Validators.max`
 *   - `Validators.maxlength`
 *   - `Validators.min`
 *   - `Validators.minlength`
 *   - `Validators.required`
 *   - `matDatepickerMin`
 *   - `matDatepickerMax`
 *   - `matDatepickerParse`
 *
 * **Generic**:
 *
 * Any validators that return a `ValidationErrorsWithMessage`.
 *
 * @param unit is used to build the message for the following validators: `min`, `max`, and any `ValidationErrorsWithMessage` whose message is a function
 */
@Pipe({
    name: 'errorMessage',
})
export class NaturalErrorMessagePipe implements PipeTransform {
    public transform(errors: ValidationErrors | null | undefined, unit = '', convertToPercentage = false): string {
        if (!errors) {
            return '';
        }

        if (unit) {
            unit = ` ${unit}`;
        }

        if (convertToPercentage) {
            errors = this.asPercentage(errors);
        }

        if (errors.required) {
            return $localize`Requis`;
        } else if (errors.minlength) {
            return $localize`Minimum ${errors.minlength.requiredLength} caractères`;
        } else if (errors.maxlength) {
            return $localize`Maximum ${errors.maxlength.requiredLength} caractères`;
        } else if (errors.min) {
            return $localize`Doit être plus grand ou égal à ${errors.min.min}${unit}`;
        } else if (errors.max) {
            return $localize`Doit être plus petit ou égal à ${errors.max.max}${unit}`;
        } else if (errors.matDatepickerParse) {
            return $localize`Date invalide`;
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
        }

        const firstMessage: unknown = Object.values(errors).find(
            error =>
                error &&
                typeof error === 'object' &&
                error.message &&
                ['string', 'function'].includes(typeof error.message),
        )?.message;

        if (typeof firstMessage === 'string') {
            return firstMessage;
        } else if (typeof firstMessage === 'function') {
            return firstMessage(unit);
        }

        return '';
    }

    private asPercentage(errors: ValidationErrors): ValidationErrors {
        const result: ValidationErrors = {...errors};

        if (errors.min) {
            result.min = {
                min: factorToPercentage(errors.min.min),
                actual: factorToPercentage(errors.min.actual),
            };
        }

        if (errors.max) {
            result.max = {
                max: factorToPercentage(errors.max.max),
                actual: factorToPercentage(errors.max.actual),
            };
        }

        if (errors.greaterThan) {
            const min = factorToPercentage(errors.greaterThan.greaterThan);
            result.greaterThan = {
                greaterThan: min,
                actual: factorToPercentage(errors.greaterThan.actual),
                message: (unit: string) => $localize`Doit être plus grand que ${min}${unit}`,
            };
        }

        // The two decimals of a factor are the whole percentages the field accepts. A bound that is
        // out of reach is more useful to hear than the decimals, so it keeps the message for itself.
        if (errors.decimal && !result.min && !result.max && !result.greaterThan) {
            if (errors.decimal.scale > 2) {
                const scale = errors.decimal.scale - 2;
                result.decimal.message = $localize`Maximum de ${scale} décimales`;
            } else {
                result.decimal.message = $localize`Doit être un nombre entier`;
            }
        }

        return result;
    }
}
