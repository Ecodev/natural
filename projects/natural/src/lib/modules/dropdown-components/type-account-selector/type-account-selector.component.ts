import {Component, inject} from '@angular/core';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalHierarchicSelectorComponent} from '../../hierarchic-selector/hierarchic-selector/hierarchic-selector.component';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {
    TypeHierarchicSelectorComponent,
    TypeHierarchicSelectorConfiguration,
} from '../type-hierarchic-selector/type-hierarchic-selector.component';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import type {PossibleDiscreteOperatorKeys} from '../types';
import {DO_INIT} from '../abstract-association-select-component.directive';
import {startWith} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export type PossibleWhereKeys = 'DebitOrCredit' | 'Debit' | 'Credit';

type PossibleWhere = {
    key: PossibleWhereKeys;
    label: string;
    render: string;
};

export type Extra = {
    where: PossibleWhereKeys;
    recursive: boolean;
};

const possibleWhere: readonly PossibleWhere[] = [
    {
        key: 'DebitOrCredit',
        label: $localize`Débit ou crédit`,
        render: ``,
    },
    {
        key: 'Debit',
        label: $localize`Débit`,
        render: $localize`au débit`,
    },
    {
        key: 'Credit',
        label: $localize`Crédit`,
        render: $localize`au crédit`,
    },
] as const;

/**
 * This is a specialized facet for Account model with extra fields specific to the specialized operator on the server side.
 */
@Component({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatSelect,
        MatOption,
        NaturalHierarchicSelectorComponent,
        MatCheckbox,
    ],
    templateUrl: './type-account-selector.component.html',
    providers: [
        {
            provide: DO_INIT,
            useValue: false,
        },
    ],
})
export class TypeAccountSelectorComponent extends TypeHierarchicSelectorComponent {
    public readonly whereCtrl = new FormControl<PossibleWhereKeys>('DebitOrCredit', {
        nonNullable: true,
        validators: Validators.required,
    });

    public readonly recursiveCtrl = new FormControl<boolean>(false, {
        nonNullable: true,
        validators: Validators.required,
    });

    protected readonly possibleWhere = possibleWhere;

    public constructor() {
        super();

        // We can reload extra condition only after calling ou parent constructor
        const data = inject<NaturalDropdownData<TypeHierarchicSelectorConfiguration>>(NATURAL_DROPDOWN_DATA);
        this.init(data);

        this.form.addControl('where', this.whereCtrl);
        this.form.addControl('recursive', this.recursiveCtrl);

        this.operatorCtrl.valueChanges
            .pipe(takeUntilDestroyed(), startWith(this.operatorCtrl.value))
            .subscribe(operator => {
                if (['is', 'isnot'].includes(operator)) {
                    this.recursiveCtrl.enable();
                } else {
                    this.recursiveCtrl.setValue(false);
                    this.recursiveCtrl.disable();
                }
            });
    }

    protected override operatorKeyToCondition(
        key: PossibleDiscreteOperatorKeys,
        values: string[],
    ): FilterGroupConditionField {
        return super.operatorKeyToCondition(key, values, {
            where: this.whereCtrl.value,
            recursive: this.recursiveCtrl.getRawValue(),
        } satisfies Extra);
    }

    protected override reloadCondition(condition: FilterGroupConditionField | null): void {
        if (condition) {
            const q = (condition.have ? condition.have : condition.empty) as Partial<Extra> | null;
            this.recursiveCtrl.setValue(q?.recursive ?? false);
            this.whereCtrl.setValue(q?.where ?? 'DebitOrCredit');
        }

        super.reloadCondition(condition);
    }

    protected override getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        const where = this.possibleWhere.find(v => v.key === this.whereCtrl.value);
        if (!operator || !where || !this.isValid()) {
            return '';
        }

        const selection = this.renderValueWithoutOperator();
        const recursive = this.recursiveCtrl.value ? $localize`(inclut sous-comptes)` : '';

        const parts = ['is', 'isnot'].includes(operator.key)
            ? [where.render, operator.label, selection, recursive]
            : [operator.label, where.render];

        return parts.filter(v => v).join(' ');
    }
}
