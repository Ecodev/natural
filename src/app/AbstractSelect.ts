import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {collectErrors, validateAllFormControls} from '@ecodev/natural';
import {Observable} from 'rxjs';
import {ErrorService} from '../../projects/natural/src/lib/testing/error.service';
import {Item, ItemService} from '../../projects/natural/src/lib/testing/item.service';
import {inject} from '@angular/core';

export class AbstractSelect {
    public required = true;

    public readonly formControl = new FormControl<Item | null>(null, this.getRequiredAtStart());

    /**
     * Form control for new instance testing
     */
    public formControlReplace = new FormControl<Item | null>(null, this.getRequiredAtStart());

    /**
     * Form group for testing update on formContr11olName directives
     */
    public readonly formGroup = new FormGroup({
        amazingField: new FormControl<Item | null>(null, this.getRequiredAtStart()),
    });

    /**
     * Form group for testing replacement on formControlName directives
     */
    public formGroupReplace = new FormGroup({
        amazingField: new FormControl<Item | null>(null, this.getRequiredAtStart()),
    });

    public myValue: Item | null = null;
    public disabled = false;
    public freeText: Item | string | null = null;
    public withoutModelOutput: Item | string | string[] | null = null;
    public readonly service = inject(ItemService);
    public readonly errorService = inject(ErrorService);

    public toggleDisabledAllFormControls(): void {
        this.formControl.disabled ? this.formControl.enable() : this.formControl.disable();
        this.formControlReplace.disabled ? this.formControlReplace.enable() : this.formControlReplace.disable();
        this.formGroup.disabled ? this.formGroup.enable() : this.formGroup.disable();
        this.formGroupReplace.disabled ? this.formGroupReplace.enable() : this.formGroupReplace.disable();
        this.disabled = !this.disabled;
    }

    /**
     * All FormGroups and FormControls on first instantiation (page init)
     */
    private getRequiredAtStart(): ValidatorFn | null {
        return Validators.required;
    }

    /**
     * FormGroups and FormControls that receive new instance on update
     */
    private getRequiredOnChange(): ValidatorFn | null {
        return Validators.required;
    }

    public validateAllFormControls(): void {
        validateAllFormControls(this.formControl);
        validateAllFormControls(this.formControlReplace);
        validateAllFormControls(this.formGroup);
        validateAllFormControls(this.formGroupReplace);
        console.log('form errors formControl', collectErrors(this.formControl));
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
            this.formGroup.setValue({amazingField: this.myValue});

            this.formControlReplace = new FormControl(this.myValue, this.getRequiredOnChange());
            this.formGroupReplace = new FormGroup({
                amazingField: new FormControl<Item | null>(this.myValue, this.getRequiredOnChange()),
            });
        });
    }

    public clearValue(): void {
        this.myValue = null;

        this.formControl.setValue(this.myValue);
        this.formGroup.setValue({amazingField: this.myValue});

        this.formControlReplace = new FormControl(this.myValue, this.getRequiredOnChange());
        this.formGroupReplace = new FormGroup({
            amazingField: new FormControl<Item | null>(this.myValue, this.getRequiredOnChange()),
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
