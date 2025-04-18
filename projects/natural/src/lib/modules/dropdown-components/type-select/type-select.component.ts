import {AfterViewInit, Component, DestroyRef, inject, viewChild} from '@angular/core';
import {MatListModule, MatSelectionList} from '@angular/material/list';
import {BehaviorSubject, merge, Observable, of} from 'rxjs';
import {FilterGroupConditionField, Scalar} from '../../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {PossibleDiscreteOperatorKeys, possibleDiscreteOperators} from '../types';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type TypeSelectItem =
    | Scalar
    | {
          id: Scalar;
          name: Scalar;
      }
    | {
          value: Scalar;
          name: Scalar;
      };

export type TypeSelectConfiguration = {
    items: TypeSelectItem[] | Observable<TypeSelectItem[]>;
    multiple?: boolean;
    /**
     * If true (default) a selectbox allows to choose an operator. Otherwise, the selectbox is hidden and the operator will always be `is`.
     */
    operators?: boolean;
};

@Component({
    templateUrl: './type-select.component.html',
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatListModule],
})
export class TypeSelectComponent implements DropdownComponent, AfterViewInit {
    private readonly destroyRef = inject(DestroyRef);
    public readonly renderedValue = new BehaviorSubject<string>('');
    public readonly list = viewChild(MatSelectionList);
    public requireValueCtrl = false;
    public readonly operators = possibleDiscreteOperators;
    public readonly operatorCtrl = new FormControl<PossibleDiscreteOperatorKeys>('is', {nonNullable: true});
    public readonly valueCtrl = new FormControl();
    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
    });

    public items: TypeSelectItem[] = [];
    public readonly configuration: Required<TypeSelectConfiguration>;

    private readonly defaults: Required<TypeSelectConfiguration> = {
        items: [],
        multiple: true,
        operators: true,
    };

    public constructor() {
        const data = inject<NaturalDropdownData<TypeSelectConfiguration>>(NATURAL_DROPDOWN_DATA);

        this.configuration = {...this.defaults, ...data.configuration};

        // Immediately initValidators and everytime the operator change later
        this.operatorCtrl.valueChanges.pipe(startWith(null)).subscribe(() => this.initValidators());

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            const rendered = this.getRenderedValue();
            this.renderedValue.next(rendered);
        });

        this.reloadCondition(data.condition);
    }

    public ngAfterViewInit(): void {
        const list = this.list();
        if (!this.isMultiple() && list) {
            (list.selectedOptions as any)._multiple = false;
        }
    }

    public getId(item: TypeSelectItem): Scalar {
        if (typeof item === 'object' && item) {
            return (item as any).id || (item as any).value;
        }

        return item;
    }

    public getDisplay(item: TypeSelectItem): Scalar {
        if (typeof item === 'object' && item?.name) {
            return item.name;
        }

        return item as Scalar;
    }

    public getCondition(): FilterGroupConditionField {
        if (!this.isValid()) {
            return {};
        }

        const values = this.valueCtrl.value;
        return this.operatorKeyToCondition(this.operatorCtrl.value, values);
    }

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

    private isMultiple(): boolean {
        return this.configuration.multiple;
    }

    private getItemById(id: Scalar): TypeSelectItem | undefined {
        return this.items.find(item => this.getId(item) === id);
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (condition) {
            const operatorKey = this.conditionToOperatorKey(condition);
            this.operatorCtrl.setValue(operatorKey);
        }

        // Always reload value, even without condition because we need to load list of available items in all cases
        this.reloadValue(condition).subscribe(value => {
            this.valueCtrl.setValue(value);
            this.renderedValue.next(this.getRenderedValue());
        });
    }

    /**
     * Reload the value from API (`operatorCtrl` should not be touched)
     */
    private reloadValue(condition: FilterGroupConditionField | null): Observable<Scalar[]> {
        const wantedIds = condition?.in?.values ?? [];

        const items$ = Array.isArray(this.configuration.items)
            ? of(this.configuration.items)
            : this.configuration.items;

        return items$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map(items => {
                this.items = items;

                // Reload selection, according to possible values from configuration
                const possibleIds = this.items.map(item => this.getId(item));
                const wantedAndPossibleIds = wantedIds.filter(id => possibleIds.some(i => i === id));

                return wantedAndPossibleIds;
            }),
        );
    }

    private getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        if (!operator || !this.isValid()) {
            return '';
        }

        const selection =
            this.valueCtrl.value
                ?.map((id: Scalar) => {
                    const item = this.getItemById(id);
                    if (item) {
                        return this.getDisplay(item);
                    }
                })
                .join(', ') ?? null;

        return [operator.label, selection].filter(v => v).join(' ');
    }

    private conditionToOperatorKey(condition: FilterGroupConditionField): PossibleDiscreteOperatorKeys {
        if (!this.configuration.operators) {
            return 'is';
        }

        if (condition.in && !condition.in.not) {
            return 'is';
        } else if (condition.in?.not) {
            return 'isnot';
        } else if (condition.null?.not) {
            return 'any';
        } else if (condition.null && !condition.null.not) {
            return 'none';
        }

        return 'is';
    }

    private operatorKeyToCondition(key: PossibleDiscreteOperatorKeys, values: Scalar[]): FilterGroupConditionField {
        switch (key) {
            case 'is':
                return {in: {values: values}};
            case 'isnot':
                return {in: {values: values, not: true}};
            case 'any':
                return {null: {not: true}};
            case 'none':
                return {null: {not: false}};
            default:
                throw new Error('Unsupported operator key: ' + (key as string));
        }
    }
}
