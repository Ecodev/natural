import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MatOption} from '@angular/material/core';
import {BehaviorSubject, merge, startWith} from 'rxjs';
import {FilterGroupConditionField, Scalar} from '../../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {
    type PossibleComparableOperator,
    PossibleComparableOperatorKeys,
    possibleComparableOperators,
    possibleNullComparableOperators,
} from '../types';
import {dateMax, dateMin, serialize} from '../utils';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';

export type TypeDateConfiguration<D = Date> = {
    min?: D | null;
    max?: D | null;
    /**
     * If true, two extra choices, "avec" and "sans", will be shown to filter by the (in-)existence of a value
     */
    nullable?: boolean;
};

@Component({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        MatSuffix,
        MatSelect,
        MatOption,
        MatInput,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatCheckbox,
    ],
    templateUrl: './type-date.component.html',
    styleUrl: './type-date.component.scss',
})
export class TypeDateComponent<D = any> implements DropdownComponent {
    private dateAdapter = inject<DateAdapter<D>>(DateAdapter);
    private dateFormats = inject(MAT_DATE_FORMATS);

    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly configuration: Required<TypeDateConfiguration<D>>;
    public readonly operatorCtrl = new FormControl<PossibleComparableOperatorKeys>('equal', {nonNullable: true});
    public readonly valueCtrl = new FormControl<D | null>(null);
    public readonly todayCtrl = new FormControl(false);
    public requireValueCtrl = false;
    public readonly operators: readonly PossibleComparableOperator[];

    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
        today: this.todayCtrl,
    });

    private readonly defaults: Required<TypeDateConfiguration<D>> = {
        min: null,
        max: null,
        nullable: false,
    };

    public constructor() {
        const data = inject<NaturalDropdownData<TypeDateConfiguration<D>>>(NATURAL_DROPDOWN_DATA);

        this.configuration = {...this.defaults, ...data.configuration};

        this.operators = this.configuration.nullable ? possibleNullComparableOperators : possibleComparableOperators;

        this.todayCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(isToday => {
            if (isToday) {
                this.valueCtrl.setValue(this.dateAdapter.today());
                this.valueCtrl.disable();
            } else {
                this.valueCtrl.enable();
            }
        });

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges, this.todayCtrl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.renderedValue.next(this.getRenderedValue()));

        // Immediately initValidators and everytime the operator change later
        this.operatorCtrl.valueChanges.pipe(startWith(null)).subscribe(() => this.initValidators());

        this.reloadCondition(data.condition);
    }

    public getCondition(): FilterGroupConditionField {
        let operator = this.operatorCtrl.value;
        if (operator === 'any') {
            return {null: {not: true}};
        } else if (operator === 'none') {
            return {null: {not: false}};
        } else if (!this.valueCtrl.value) {
            return {};
        }

        let date: string;
        let dayAfter: string;

        if (this.todayCtrl.value) {
            date = 'today';
            dayAfter = 'tomorrow';
        } else {
            date = serialize(this.dateAdapter, this.valueCtrl.value);
            dayAfter = serialize(this.dateAdapter, this.getDayAfter(this.valueCtrl.value));
        }

        if (operator === 'equal') {
            return {
                greaterOrEqual: {value: date},
                less: {value: dayAfter},
            };
        } else {
            // Transparently adapt exclusive/inclusive ranges
            if (date !== 'today') {
                if (operator === 'greater') {
                    operator = 'greaterOrEqual';
                    date = dayAfter;
                } else if (operator === 'lessOrEqual') {
                    operator = 'less';
                    date = dayAfter;
                }
            }

            return {[operator]: {value: date}};
        }
    }

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        // Special case for '='
        if (condition.greaterOrEqual && condition.less) {
            this.operatorCtrl.setValue('equal');
            this.setTodayOrDate(condition.greaterOrEqual.value);

            return;
        }

        const operatorKey = this.conditionToOperatorKey(condition);
        this.operatorCtrl.setValue(operatorKey);
        this.setTodayOrDate(condition[operatorKey]?.value);
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

    private setTodayOrDate(value: Scalar): void {
        if (value === 'today') {
            this.valueCtrl.setValue(this.dateAdapter.today());
            this.todayCtrl.setValue(true);
        } else {
            this.valueCtrl.setValue(this.dateAdapter.deserialize(value));
            this.todayCtrl.setValue(false);
        }
    }

    private initValidators(): void {
        const blacklist: PossibleComparableOperatorKeys[] = ['any', 'none'];
        this.requireValueCtrl = !blacklist.includes(this.operatorCtrl.value);
        const validators: ValidatorFn[] = this.requireValueCtrl ? [Validators.required] : [];
        if (this.configuration.min) {
            validators.push(dateMin(this.dateAdapter, this.configuration.min));
        }

        if (this.configuration.max) {
            validators.push(dateMax(this.dateAdapter, this.configuration.max));
        }

        this.valueCtrl.setValidators(validators);
        this.valueCtrl.updateValueAndValidity();
    }

    private getDayAfter(date: D): D {
        return this.dateAdapter.addCalendarDays(this.dateAdapter.clone(date), 1);
    }

    private getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);

        let value = '';
        if (this.todayCtrl.value) {
            value = $localize`Aujourd'hui`;
        } else if (this.valueCtrl.value) {
            value = this.dateAdapter.format(this.valueCtrl.value, this.dateFormats.display.dateInput);
        }

        if (operator && ['any', 'none'].includes(operator.key)) {
            return operator.label;
        } else if (operator && value) {
            return operator.label + ' ' + value;
        } else {
            return '';
        }
    }
}
