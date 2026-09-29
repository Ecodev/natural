import {Directive, inject, type OnInit} from '@angular/core';
import {NgControl, NumberValueAccessor} from '@angular/forms';

/**
 * Transforms `0.57` into `57`, avoiding floating-point math errors entirely.
 */
export function factorToPercentage(value: number | string): number {
    return Number(value + 'e2');
}

/**
 * Transforms `57` into `0.57`, avoiding floating-point math errors entirely.
 */
function percentageToFactor(value: number | string): number {
    return Number(value + 'e-2');
}

function uiToModel(uiValue: number | string | null): number | null {
    return uiValue === null || uiValue === '' ? null : percentageToFactor(uiValue);
}

function modelToUi(modelValue: number | null): number | string {
    return modelValue === null ? '' : factorToPercentage(modelValue);
}
/**
 * Allow to show `35` to human, but actually have `0.35` in the model.
 */
@Directive({
    selector:
        // eslint-disable-next-line @angular-eslint/directive-selector
        'input[type=number][percentageInput][formControl], input[type=number][percentageInput][formControlName]',
})
export class NaturalPercentageInputDirective implements OnInit {
    private readonly ngControl = inject(NgControl, {self: true});

    public ngOnInit(): void {
        const valueAccessor = this.ngControl.valueAccessor;
        if (!valueAccessor || !(valueAccessor instanceof NumberValueAccessor)) {
            throw new Error('No number value accessor found for NaturalPercentageInputDirective');
        }

        // Capture the original methods from the value accessor
        const originalWriteValue = valueAccessor.writeValue.bind(valueAccessor);
        const originalRegisterOnChange = valueAccessor.registerOnChange.bind(valueAccessor);

        // Transforms the incoming model value to the UI value type and then call the original implementation.
        valueAccessor.writeValue = (modelValue: number) => originalWriteValue(modelToUi(modelValue) as number);

        // Transforms the incoming UI value to the model value type and then call the original implementation.
        valueAccessor.registerOnChange = (onChange: (val: number | null) => void) => {
            originalRegisterOnChange(uiValue => {
                onChange(uiToModel(uiValue));
            });
        };

        // Override the native value accessor `onChange` that is already registered (because registerOnChange
        // may have been called before this directive initialized)
        valueAccessor.onChange = (uiValue: number) => this.ngControl.control?.setValue(uiToModel(uiValue));

        // Re-set the same value so our transformations are called immediatelly after our initialization
        valueAccessor.writeValue(this.ngControl.control ? this.ngControl.control.value : undefined);
    }
}
