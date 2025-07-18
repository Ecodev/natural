import {AbstractControl, UntypedFormArray, UntypedFormGroup} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {merge} from 'es-toolkit';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {NaturalQueryVariablesManager, QueryVariables} from './query-variable-manager';
import {ExtractTallOne, ExtractVall, Literal} from '../types/types';
import {validateAllFormControls} from './validators';
import {Directive} from '@angular/core';
import {PaginatedData} from './data-source';

/**
 * This class helps managing non-paginated rows of items that can be edited in-place, typically in a <mat-table>.
 * But it does **not** mutate anything to persist the edits on the server. It is up to the consuming component to implement
 * custom mutation mechanism.
 *
 * To access data of this component from a parent component, use:
 *
 * ```ts
 * private readonly cmp = viewChildren(ComponentType);
 *
 * this.cmp.getItems();
 * ```
 *
 * To add empty line, call:
 *
 * ```
 * this.cmp.addEmpty();
 * ```
 *
 * @dynamic
 */
@Directive({standalone: true})
export class NaturalAbstractEditableList<
    TService extends NaturalAbstractModelService<
        any,
        any,
        PaginatedData<Literal>,
        QueryVariables,
        any,
        any,
        any,
        any,
        any,
        any
    >,
    // The Literal here is a bit too loose. Ideally we would like to express
    // "it must be a union and one of the type in the union must be ExtractTallOne<TService>"
    T extends Literal = ExtractTallOne<TService>,
> {
    public readonly form: UntypedFormGroup;
    public readonly formArray = new UntypedFormArray([]);
    public readonly variablesManager = new NaturalQueryVariablesManager<ExtractVall<TService>>();
    public readonly dataSource = new MatTableDataSource<AbstractControl>();

    public constructor(protected readonly service: TService) {
        // Create a form group with a line attributes that contain an array of formGroups (one by line = one by model)
        this.form = new UntypedFormGroup({rows: this.formArray});
        this.dataSource.data = this.formArray.controls;
        this.variablesManager.set('pagination', {pagination: {pageSize: 999, pageIndex: 0}} as ExtractVall<TService>);
    }

    /**
     * Set the list of items (overwriting what may have existed)
     */
    public setItems(items: readonly T[]): void {
        this.formArray.clear(); // reset list
        this.addItems(items);
    }

    /**
     * Add given items to the list
     * Reproduces the model data loading the same way as it would be on a detail page (via AbstractDetail controller) but without resolving
     */
    public addItems(items: readonly T[]): void {
        items.forEach(item => {
            const completedItem = merge(this.service.getDefaultForServer(), item);
            const lineFormGroup = this.service.getFormGroup(completedItem);
            this.formArray.push(lineFormGroup);
        });

        this.dataSource.data = this.formArray.controls;
    }

    public removeAt(index: number): void {
        this.formArray.removeAt(index);
        this.dataSource.data = this.formArray.controls;
    }

    /**
     * Add empty item at the end of the list
     */
    public addEmpty(): void {
        this.addItems([{} as T]);
    }

    /**
     * Return a list of models without any treatment.
     *
     * To mutate models, it would be required to map them using :
     *  - AbstractModelService.getInput()
     *  - AbstractModelService.getPartialVariablesForCreation()
     *  - AbstractModelService.getPartialVariablesForUpdate()
     *  - some other required treatment.
     *
     * TODO return type is incorrect and should be closer to `Partial<T>[]` or an even looser type, because we don't really know what fields exists in the form. When we fix this, we should also remove type coercing in unit tests.
     */
    public getItems(): T[] {
        return this.formArray.getRawValue();
    }

    /**
     * Force the form validation.
     *
     * The valid state can then be read via `this.form.valid`
     */
    public validateForm(): void {
        validateAllFormControls(this.form);
    }
}
