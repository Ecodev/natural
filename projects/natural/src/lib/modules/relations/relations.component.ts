import {
    Component,
    contentChild,
    DestroyRef,
    inject,
    Input,
    OnChanges,
    OnInit,
    output,
    TemplateRef,
    viewChild,
    input,
} from '@angular/core';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {NaturalDataSource, PaginatedData} from '../../classes/data-source';
import {NaturalQueryVariablesManager, PaginationInput, QueryVariables} from '../../classes/query-variable-manager';
import {HierarchicFiltersConfiguration} from '../hierarchic-selector/classes/hierarchic-filters-configuration';
import {LinkableObject, NaturalLinkMutationService} from '../../services/link-mutation.service';
import {NaturalHierarchicConfiguration} from '../hierarchic-selector/classes/hierarchic-configuration';
import {HierarchicDialogConfig} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import {NaturalHierarchicSelectorDialogService} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.service';
import {NaturalSelectComponent} from '../select/select/select.component';
import {NaturalAbstractModelService} from '../../services/abstract-model.service';
import {ExtractTallOne, ExtractVall} from '../../types/types';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NaturalIconDirective} from '../icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {finalize, forkJoin, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Custom template usage :
 *
 * ```html
 * <natural-relations [main]="owner" [service]="svc" [filter]="{}" placeholder="Select an item">
 *     <ng-template let-item="item">
 *         <span>{{ item.xxx }}</span>
 *     </ng-template>
 * </natural-relations>
 * ```
 */
@Component({
    selector: 'natural-relations',
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        NaturalIconDirective,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        NaturalSelectComponent,
    ],
    templateUrl: './relations.component.html',
    styleUrl: './relations.component.scss',
})
export class NaturalRelationsComponent<
        TService extends NaturalAbstractModelService<
            unknown,
            any,
            PaginatedData<LinkableObject>,
            QueryVariables,
            unknown,
            any,
            unknown,
            any,
            unknown,
            any
        >,
    >
    implements OnInit, OnChanges
{
    private readonly destroyRef = inject(DestroyRef);
    private readonly linkMutationService = inject(NaturalLinkMutationService);
    private readonly hierarchicSelectorDialog = inject(NaturalHierarchicSelectorDialogService);
    private readonly select = viewChild<NaturalSelectComponent<TService>>(NaturalSelectComponent);
    public readonly itemTemplate = contentChild<TemplateRef<unknown>>(TemplateRef);

    private _service!: TService;

    public get service(): TService {
        return this._service;
    }

    @Input({required: true})
    public set service(service: TService) {
        this._service = service;
        this.loading = true;
        const items$ = this._service.watchAll(this.variablesManager).pipe(
            takeUntilDestroyed(this.destroyRef),
            tap({
                next: () => (this.loading = false),
                complete: () => (this.loading = false),
                error: () => (this.loading = false),
            }),
        );

        this.dataSource = new NaturalDataSource(items$);
    }

    /**
     * The placeholder used in the button to add a new relation
     */
    public readonly placeholder = input('');

    /**
     * Filter for autocomplete selector
     */
    public readonly autocompleteSelectorFilter = input<ExtractVall<TService>['filter'] | null>();

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    public readonly displayWith = input<(item: ExtractTallOne<TService> | null) => string>();

    /**
     * Whether the relations can be changed
     */
    @Input() public disabled = false;

    /**
     * The main object to which all relations belong to
     */
    @Input({required: true}) public main!: LinkableObject & {permissions?: {update: boolean}};

    /**
     * Emits after relations were successfully added on the server
     */
    public readonly selectionChange = output();

    /**
     * Filters for hierarchic selector
     */
    public readonly hierarchicSelectorFilters = input<HierarchicFiltersConfiguration | null>();

    /**
     * Configuration in case we prefer hierarchic selection over autocomplete selection
     */
    public readonly hierarchicSelectorConfig = input<NaturalHierarchicConfiguration[]>();

    /**
     * Link mutation semantic
     */
    @Input() public otherName?: string | null;

    /**
     * Listing service instance
     */
    public dataSource!: NaturalDataSource<PaginatedData<LinkableObject>>;
    public loading = false;

    /**
     * Table columns
     */
    public displayedColumns = ['name'];

    public readonly pageSizeOptions = [5, 25, 50, 100];
    protected readonly defaultPagination = {
        pageIndex: 0,
        pageSize: 25,
    };

    /**
     * Observable variables/options for listing service usage and apollo watchQuery
     */
    private variablesManager = new NaturalQueryVariablesManager<QueryVariables>();

    public readonly removing = new Set<LinkableObject>();

    /**
     * The filter used to filter relations
     *
     * So if the relations are from one action -> to many objectives, then the filter must filter
     * the objectives that have indeed a relation to the particular action.
     */
    @Input()
    public set filter(filter: ExtractVall<TService>['filter']) {
        this.variablesManager.set('relations-filter', {filter: filter});
    }

    /**
     * The sorting used to sort relations
     *
     * So if the relations are from one action -> to many objectives, then the sorting must sort
     * the objectives that have indeed a relation to the particular action.
     */
    @Input()
    public set sorting(sorting: ExtractVall<TService>['sorting']) {
        this.variablesManager.set('relations-sorting', {sorting: sorting});
    }

    public ngOnChanges(): void {
        if (this.disabled && this.displayedColumns.includes('unlink')) {
            this.displayedColumns.pop();
        } else if (!this.disabled && !this.displayedColumns.includes('unlink')) {
            this.displayedColumns.push('unlink');
        }
    }

    public ngOnInit(): void {
        this.pagination();

        // Force disabled if cannot update object
        if (this.main && this.main.permissions) {
            this.disabled = this.disabled || !this.main.permissions.update;
        }
    }

    /**
     * Unlink action
     * Refetch result to display it in table
     */
    public removeRelation(relation: LinkableObject): void {
        this.removing.add(relation);

        this.linkMutationService
            .unlink(this.main, relation, this.otherName)
            .pipe(finalize(() => this.removing.delete(relation)))
            .subscribe(() => this.dataSource?.remove(relation));
    }

    /**
     * Link action
     * Refetch result to display it in table
     * TODO : could maybe use "update" attribute of apollo.mutate function to update table faster (but hard to do it here)
     */
    public addRelations(relations: (LinkableObject | ExtractTallOne<TService> | string | null)[]): void {
        const observables = relations
            .filter((relation): relation is LinkableObject => !!relation && typeof relation === 'object')
            .map(relation => this.linkMutationService.link(this.main, relation, this.otherName));

        forkJoin(observables).subscribe(() => {
            this.selectionChange.emit();
            this.select()?.clear();
        });
    }

    public pagination(event?: PageEvent): void {
        let pagination: PaginationInput | null = null;
        if (
            event &&
            (event.pageIndex !== this.defaultPagination.pageIndex || event.pageSize !== this.defaultPagination.pageSize)
        ) {
            pagination = {
                pageIndex: event.pageIndex,
                pageSize: event.pageSize,
            };
        }

        this.variablesManager.set('pagination', {pagination: pagination ? pagination : this.defaultPagination});
    }

    public getDisplayFn(): (item: ExtractTallOne<TService> | null) => string {
        const displayWith = this.displayWith();
        if (displayWith) {
            return displayWith;
        }

        return (item: any) => (item ? item.fullName || item.name : '');
    }

    public openNaturalHierarchicSelector(): void {
        const selectAtKey = this.getSelectKey();

        const hierarchicSelectorConfig = this.hierarchicSelectorConfig();
        if (!selectAtKey || !hierarchicSelectorConfig) {
            return;
        }

        const selected = {};

        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: hierarchicSelectorConfig,
            hierarchicSelection: selected,
            hierarchicFilters: this.hierarchicSelectorFilters(),
            multiple: true,
        };

        this.hierarchicSelectorDialog
            .open(hierarchicConfig)
            .afterClosed()
            .subscribe(result => {
                if (result?.hierarchicSelection !== undefined) {
                    const selection = result.hierarchicSelection[selectAtKey];
                    if (selection.length) {
                        this.addRelations(selection);
                    }
                }
            });
    }

    private getSelectKey(): string | undefined {
        const hierarchicSelectorConfig = this.hierarchicSelectorConfig();
        if (!hierarchicSelectorConfig) {
            return;
        }

        return hierarchicSelectorConfig.find(c => !!c.selectableAtKey)?.selectableAtKey;
    }
}
