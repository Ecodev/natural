import {Directive, inject, InjectionToken} from '@angular/core';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../search/types/dropdown-component';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PossibleDiscreteOperatorKeys, possibleDiscreteOperators} from './types';
import {startWith} from 'rxjs/operators';
import type {PossibleWhereKeys} from './type-account-selector/type-account-selector.component';

// If you use this to set it to false, then you **MUST** call the init method in your constructor
export const DO_INIT = new InjectionToken<boolean>('Must be true', {
    factory: () => true,
});

@Directive()
export abstract class AbstractAssociationSelectComponent<C> implements DropdownComponent {
    public configuration!: C;
    public readonly renderedValue = new BehaviorSubject<string>('');

    public requireValueCtrl = false;
    public readonly operators = possibleDiscreteOperators;
    public readonly operatorCtrl = new FormControl<PossibleDiscreteOperatorKeys>('is', {nonNullable: true});
    public readonly valueCtrl = new FormControl();
    public readonly form = new FormGroup<{
        operator: FormControl<PossibleDiscreteOperatorKeys>;
        value: FormControl<unknown>;
        where?: FormControl<PossibleWhereKeys>;
        recursive?: FormControl<boolean>;
    }>({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
    });

    public constructor() {
        if (inject(DO_INIT)) {
            const data = inject<NaturalDropdownData<C>>(NATURAL_DROPDOWN_DATA);
            this.init(data);
        }
    }

    protected init(data: NaturalDropdownData<C>): void {
        this.configuration = data.configuration;

        // Immediately initValidators and everytime the operator change later
        this.operatorCtrl.valueChanges.pipe(startWith(null)).subscribe(() => this.initValidators());

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            const rendered = this.getRenderedValue();
            this.renderedValue.next(rendered);
        });

        this.reloadCondition(data.condition);
    }

    /**
     * Reload the value from API (`operatorCtrl` should not be touched)
     */
    protected abstract reloadValue(condition: FilterGroupConditionField): Observable<unknown>;

    protected abstract renderValueWithoutOperator(): string;

    public abstract getCondition(): FilterGroupConditionField;

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

    private initValidators(): void {
        const whitelist: PossibleDiscreteOperatorKeys[] = ['is', 'isnot'];
        this.requireValueCtrl = whitelist.includes(this.operatorCtrl.value);
        const validators: ValidatorFn[] = this.requireValueCtrl ? [Validators.required] : [];

        this.valueCtrl.setValidators(validators);
        this.valueCtrl.updateValueAndValidity();
    }

    protected reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        const operatorKey = this.conditionToOperatorKey(condition);
        this.operatorCtrl.setValue(operatorKey);

        this.reloadValue(condition).subscribe(value => {
            this.valueCtrl.setValue(value);
            this.renderedValue.next(this.getRenderedValue());
        });
    }

    protected getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        if (!operator || !this.isValid()) {
            return '';
        }

        const selection = this.renderValueWithoutOperator();

        return [operator.label, selection].filter(v => v).join(' ');
    }

    protected conditionToOperatorKey(condition: FilterGroupConditionField): PossibleDiscreteOperatorKeys {
        if (condition.have && !condition.have.not) {
            return 'is';
        } else if (condition.have?.not) {
            return 'isnot';
        } else if (condition.empty?.not) {
            return 'any';
        } else if (condition.empty && !condition.empty.not) {
            return 'none';
        }

        return 'is';
    }

    protected operatorKeyToCondition(
        key: PossibleDiscreteOperatorKeys,
        values: string[],
        extra: Record<string, boolean | string> = {},
    ): FilterGroupConditionField {
        switch (key) {
            case 'is':
                return {have: {values: values, ...extra}};
            case 'isnot':
                return {have: {values: values, not: true, ...extra}};
            case 'any':
                return {empty: {not: true, ...extra}};
            case 'none':
                return {empty: {not: false, ...extra}};
            default:
                throw new Error('Unsupported operator key: ' + (key as string));
        }
    }
}
