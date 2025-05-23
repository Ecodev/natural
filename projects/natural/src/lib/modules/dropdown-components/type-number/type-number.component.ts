import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {BehaviorSubject, merge} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {possibleComparableOperators, PossibleComparableOpertorKeys} from '../types';
import {InvalidWithValueStateMatcher} from '../type-text/type-text.component';
import {decimal} from '../../../classes/validators';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

export type TypeNumberConfiguration = {
    min?: number | null;
    max?: number | null;
    step?: number | null;
};

@Component({
    templateUrl: './type-number.component.html',
    styleUrl: './type-number.component.scss',
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatInputModule],
})
export class TypeNumberComponent implements DropdownComponent {
    protected dropdownRef = inject(NaturalDropdownRef);

    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly configuration: Required<TypeNumberConfiguration>;
    public readonly operatorCtrl = new FormControl<PossibleComparableOpertorKeys>('equal', {nonNullable: true});
    public readonly valueCtrl = new FormControl();
    public readonly matcher = new InvalidWithValueStateMatcher();
    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
    });
    public readonly operators = possibleComparableOperators;

    private readonly defaults: Required<TypeNumberConfiguration> = {
        min: null,
        max: null,
        step: null,
    };

    public constructor() {
        const data = inject<NaturalDropdownData<TypeNumberConfiguration>>(NATURAL_DROPDOWN_DATA);

        this.configuration = {...this.defaults, ...data.configuration};

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            const rendered = this.getRenderedValue();
            this.renderedValue.next(rendered);
        });

        this.initValidators();
        this.reloadCondition(data.condition);
    }

    public getCondition(): FilterGroupConditionField {
        const condition: FilterGroupConditionField = {};
        condition[this.operatorCtrl.value] = {
            value: this.valueCtrl.value,
        };

        return condition;
    }

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

    public close(): void {
        if (this.isValid()) {
            this.dropdownRef.close({condition: this.getCondition()});
        } else {
            this.dropdownRef.close(); // undefined value, discard changes / prevent to add a condition (on new fields
        }
    }

    private initValidators(): void {
        const validators: ValidatorFn[] = [Validators.required];
        if (typeof this.configuration.min === 'number') {
            validators.push(Validators.min(this.configuration.min));
        }

        if (typeof this.configuration.max === 'number') {
            validators.push(Validators.max(this.configuration.max));
        }

        if (this.configuration.step) {
            const decimals = /\.(\d+)$/.exec('' + this.configuration.step)?.[1] ?? '';
            const decimalCount = decimals.length;
            validators.push(decimal(decimalCount));
        }

        this.valueCtrl.setValidators(validators);
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        for (const operator of this.operators) {
            const reloadedCondition = condition[operator.key];
            if (reloadedCondition) {
                this.operatorCtrl.setValue(operator.key);
                this.valueCtrl.setValue(reloadedCondition.value);
            }
        }
    }

    private getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        if (this.valueCtrl.value === null || !operator) {
            return '';
        } else {
            return operator.label + ' ' + this.valueCtrl.value;
        }
    }
}
