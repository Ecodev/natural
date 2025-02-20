import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {collectErrors, validateAllFormControls} from '@ecodev/natural';
import {Observable} from 'rxjs';
import {ErrorService} from '../../projects/natural/src/lib/testing/error.service';
import {Item, ItemService} from '../../projects/natural/src/lib/testing/item.service';
import {inject} from '@angular/core';

export class AbstractSelect {
    public required = true;

    public readonly formControl = new FormControl(null as Item | null, Validators.required);
    public readonly alwaysInvalidFormControl = new FormControl(null as Item | null, [
        Validators.required,
        () => {
            return {
                alwaysInvalid: true,
            };
        },
    ]);

    /**
     * Form control for new instance testing
     */
    public formControlReplace = new FormControl(null as Item | null, Validators.required);

    /**
     * Form group for testing update on formContr11olName directives
     */
    public readonly formGroup = new FormGroup({
        amazingField: new FormControl(null as Item | null, Validators.required),
    });

    /**
     * Form group for testing replacement on formControlName directives
     */
    public formGroupReplace = new FormGroup({
        amazingField: new FormControl(null as Item | null, Validators.required),
    });

    public myValue: Item | null = null;
    public disabled = false;
    public freeText: Item | string | null = null;
    public withoutModelOutput: Item | string | string[] | null = null;
    public readonly service = inject(ItemService);
    public readonly errorService = inject(ErrorService);

    public toggleDisabledAllFormControls(): void {
        this.formControl.disabled ? this.formControl.enable() : this.formControl.disable();
        this.alwaysInvalidFormControl.disabled
            ? this.alwaysInvalidFormControl.enable()
            : this.alwaysInvalidFormControl.disable();
        this.formControlReplace.disabled ? this.formControlReplace.enable() : this.formControlReplace.disable();
        this.formGroup.disabled ? this.formGroup.enable() : this.formGroup.disable();
        this.formGroupReplace.disabled ? this.formGroupReplace.enable() : this.formGroupReplace.disable();
        this.disabled = !this.disabled;
    }

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        validateAllFormControls(this.alwaysInvalidFormControl);
        validateAllFormControls(this.formControlReplace);
        validateAllFormControls(this.formGroup);
        validateAllFormControls(this.formGroupReplace);
        console.log('form errors formControl', collectErrors(this.formControl));
        console.log('form errors alwaysInvalidFormControl', collectErrors(this.alwaysInvalidFormControl));
        console.log('form errors formControlReplace', collectErrors(this.formControlReplace));
        console.log('form errors formGroup', collectErrors(this.formGroup));
        console.log('form errors formGroupReplace', collectErrors(this.formGroupReplace));
    }

    protected getNextValue(): Observable<Item> {
        return this.service.getOne('foo');
    }

    public setValue(): void {
        this.getNextValue().subscribe(value => {
            this.myValue = value;

            this.formControl.setValue(this.myValue);
            this.alwaysInvalidFormControl.setValue(this.myValue);
            this.formGroup.setValue({amazingField: this.myValue});

            this.formControlReplace = new FormControl(this.myValue, Validators.required);
            this.formGroupReplace = new FormGroup({
                amazingField: new FormControl<Item | null>(this.myValue, Validators.required),
            });
        });
    }

    public clearValue(): void {
        this.myValue = null;

        this.formControl.setValue(this.myValue);
        this.alwaysInvalidFormControl.setValue(this.myValue);
        this.formGroup.setValue({amazingField: this.myValue});

        this.formControlReplace = new FormControl(this.myValue, Validators.required);
        this.formGroupReplace = new FormGroup({
            amazingField: new FormControl<Item | null>(this.myValue, Validators.required),
        });
    }

    public updateValidatorRequired(control: AbstractControl): void {
        control.setValidators(Validators.required);
        control.updateValueAndValidity();
    }

    public updateValidatorOptional(control: AbstractControl): void {
        control.clearValidators();
        control.updateValueAndValidity();
    }
}
