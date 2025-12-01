import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {BehaviorSubject, merge} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {
    type PossibleComparableOperator,
    type PossibleComparableOperatorKeys,
    possibleComparableOperators,
    possibleNullComparableOperators,
} from '../types';
import {InvalidWithValueStateMatcher} from '../type-text/type-text.component';
import {decimal} from '../../../classes/validators';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {startWith} from 'rxjs/operators';

export type TypeNumberConfiguration = {
    min?: number | null;
    max?: number | null;
    step?: number | null;
    /**
     * If true, two extra choices, "avec" and "sans", will be shown to filter by the (in-)existence of a value
     */
    nullable?: boolean;
};

@Component({
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatSelect, MatOption, MatInput],
    templateUrl: './type-number.component.html',
    styleUrl: './type-number.component.scss',
})
export class TypeNumberComponent implements DropdownComponent {
    protected dropdownRef = inject(NaturalDropdownRef);

    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly configuration: Required<TypeNumberConfiguration>;
    public readonly operatorCtrl = new FormControl<PossibleComparableOperatorKeys>('equal', {nonNullable: true});
    public readonly valueCtrl = new FormControl(null as number | null);
    public readonly matcher = new InvalidWithValueStateMatcher();
    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
    });
    public requireValueCtrl = false;
    public readonly operators: readonly PossibleComparableOperator[];
    private readonly defaults: Required<TypeNumberConfiguration> = {
        min: null,
        max: null,
        step: null,
        nullable: false,
    };

    public constructor() {
        const data = inject<NaturalDropdownData<TypeNumberConfiguration>>(NATURAL_DROPDOWN_DATA);

        this.configuration = {...this.defaults, ...data.configuration};

        this.operators = this.configuration.nullable ? possibleNullComparableOperators : possibleComparableOperators;

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            const rendered = this.getRenderedValue();
            this.renderedValue.next(rendered);
        });

        // Immediately initValidators and everytime the operator change later
        this.operatorCtrl.valueChanges.pipe(startWith(null)).subscribe(() => this.initValidators());

        this.reloadCondition(data.condition);
    }

    public getCondition(): FilterGroupConditionField {
        const key = this.operatorCtrl.value;
        const value = this.valueCtrl.value;

        switch (key) {
            case 'any':
                return {null: {not: true}};
            case 'none':
                return {null: {not: false}};
            default: {
                return {[key]: {value: value}};
            }
        }
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
        const blacklist: PossibleComparableOperatorKeys[] = ['any', 'none'];
        this.requireValueCtrl = !blacklist.includes(this.operatorCtrl.value);
        const validators: ValidatorFn[] = this.requireValueCtrl ? [Validators.required] : [];
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
        this.valueCtrl.updateValueAndValidity();
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        const operatorKey = this.conditionToOperatorKey(condition);
        this.operatorCtrl.setValue(operatorKey);
        this.valueCtrl.setValue(condition[operatorKey]?.value);
    }

    private getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        if (operator && ['any', 'none'].includes(operator.key)) {
            return operator.label;
        } else if (operator && this.valueCtrl.value !== null) {
            return operator.label + ' ' + this.valueCtrl.value;
        } else {
            return '';
        }
    }

    private conditionToOperatorKey(condition: FilterGroupConditionField): PossibleComparableOperatorKeys {
        if (condition.null?.not) {
            return 'any';
        } else if (condition.null && !condition.null.not) {
            return 'none';
        } else {
            return this.operators.find(operator => condition[operator.key])?.key ?? 'equal';
        }
    }
}
