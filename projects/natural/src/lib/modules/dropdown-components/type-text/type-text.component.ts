import {Component, inject} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * Show an error message if the control has a value and an error, even if control is not dirty and not touched.
 */
export class InvalidWithValueStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: FormControl | null): boolean {
        return control && control.invalid && control.value;
    }
}

@Component({
    templateUrl: './type-text.component.html',
    styleUrl: './type-text.component.scss',
    imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
})
export class TypeTextComponent implements DropdownComponent {
    protected dropdownRef = inject(NaturalDropdownRef);

    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly formCtrl = new FormControl('', {nonNullable: true});
    public readonly matcher = new InvalidWithValueStateMatcher();

    public constructor() {
        const data = inject<NaturalDropdownData<never>>(NATURAL_DROPDOWN_DATA);

        this.formCtrl.valueChanges.subscribe(value => {
            this.renderedValue.next(value === null ? '' : this.formCtrl.value + '');
        });

        this.formCtrl.setValidators([Validators.required]);

        if (data.condition?.like) {
            this.formCtrl.setValue('' + data.condition.like.value);
        }
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.formCtrl.value) {
            return {};
        }

        return {like: {value: this.formCtrl.value}};
    }

    public isValid(): boolean {
        return this.formCtrl.valid;
    }

    public isDirty(): boolean {
        return this.formCtrl.dirty;
    }

    public close(): void {
        if (this.isValid()) {
            this.dropdownRef.close({condition: this.getCondition()});
        } else {
            this.dropdownRef.close(); // undefined value, discard changes / prevent to add a condition (on new fields
        }
    }
}
