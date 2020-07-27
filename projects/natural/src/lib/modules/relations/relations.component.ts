import {
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {forkJoin} from 'rxjs';
import {NaturalAbstractController} from '../../classes/abstract-controller';
import {NaturalDataSource, PaginatedData} from '../../classes/data-source';
import {NaturalQueryVariablesManager, PaginationInput, QueryVariables} from '../../classes/query-variable-manager';
import {HierarchicFiltersConfiguration} from '../../modules/hierarchic-selector/classes/hierarchic-filters-configuration';
import {LinkableObject, NaturalLinkMutationService} from '../../services/link-mutation.service';
import {NaturalHierarchicConfiguration} from '../hierarchic-selector/classes/hierarchic-configuration';
import {HierarchicDialogConfig} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import {NaturalHierarchicSelectorDialogService} from '../hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.service';
import {Filter} from '../search/classes/graphql-doctrine.types';
import {NaturalSelectComponent} from '../select/select/select.component';
import {finalize} from 'rxjs/operators';
import {Literal} from '../../types/types';
import {NaturalAbstractModelService} from '../../services/abstract-model.service';

/**
 * Custom template usage :
 * <natural-relations [main]="owner" [service]="svc" [filter]="{}" placeholder="Select an item">
 *     <ng-template let-item="item">
 *         <span>{{ item.xxx }}</span>
 *     </ng-template>
 * </natural-relations>
 */

@Component({
    selector: 'natural-relations',
    templateUrl: './relations.component.html',
    styleUrls: ['./relations.component.scss'],
})
export class NaturalRelationsComponent extends NaturalAbstractController implements OnInit, OnChanges, OnDestroy {
    @ViewChild(NaturalSelectComponent) private select?: NaturalSelectComponent;
    @ContentChild(TemplateRef) public itemTemplate?: TemplateRef<any>;

    @Input() service?: NaturalAbstractModelService<
        unknown,
        any,
        PaginatedData<any>,
        QueryVariables,
        unknown,
        any,
        unknown,
        any,
        unknown,
        any
    >;

    /**
     * The placeholder used in the button to add a new relation
     */
    @Input() placeholder?: string;

    /**
     * Context filter for autocomplete selector
     */
    @Input() autocompleteSelectorFilter?: Filter;

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() displayWith?: (item: any) => string;

    /**
     * Whether the relations can be changed
     */
    @Input() disabled = false;

    /**
     * The main object to which all relations belong to
     */
    @Input() main!: LinkableObject & {permissions?: {update: boolean}};

    @Output() selectionChange: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Context filters for hierarchic selector
     */
    @Input() hierarchicSelectorFilters?: HierarchicFiltersConfiguration;

    /**
     * Configuration in case we prefer hierarchic selection over autocomplete selection
     */
    @Input() hierarchicSelectorConfig?: NaturalHierarchicConfiguration[];

    /**
     * Provide service for autocomplete selection
     */
    @Input() autocompleteSelectorService: any;

    /**
     * Link mutation semantic
     */
    @Input() otherName?: string | null;

    /**
     * Listing service instance
     */
    public dataSource?: NaturalDataSource;
    public loading = false;

    /**
     * Table columns
     */
    public displayedColumns = ['name'];

    public pageSizeOptions = [5, 10, 50, 100];
    protected defaultPagination = {
        pageIndex: 0,
        pageSize: 25,
    };

    /**
     * Observable variables/options for listing service usage and apollo watchQuery
     */
    private variablesManager: NaturalQueryVariablesManager<QueryVariables> = new NaturalQueryVariablesManager();

    constructor(
        private linkMutationService: NaturalLinkMutationService,
        private hierarchicSelectorDialog: NaturalHierarchicSelectorDialogService,
    ) {
        super();
    }

    /**
     * The filter used to filter relations
     *
     * So if the relations are from one action -> to many objectives, then the filter must filter
     * the objectives that have indeed a relation to the particular action.
     */
    @Input() set filter(filter: Filter) {
        this.variablesManager.set('relations-context', {filter: filter});
    }

    ngOnInit() {
        this.pagination();

        // Force disabled if cannot update object
        if (this.main && this.main.permissions) {
            this.disabled = this.disabled || !this.main.permissions.update;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.service) {
            this.queryItems();
        }

        if (this.disabled && this.displayedColumns.indexOf('unlink') > -1) {
            this.displayedColumns.pop();
        } else if (!this.disabled && this.displayedColumns.indexOf('unlink') === -1) {
            this.displayedColumns.push('unlink');
        }
    }

    /**
     * Unlink action
     * Refetch result to display it in table
     */
    public removeRelation(relation: LinkableObject): void {
        this.linkMutationService.unlink(this.main, relation, this.otherName).subscribe();
    }

    /**
     * Link action
     * Refetch result to display it in table
     * TODO : could maybe use "update" attribute of apollo.mutate function to update table faster (but hard to do it here)
     */
    public addRelations(relations: LinkableObject[]): void {
        const observables = relations.map(relation =>
            this.linkMutationService.link(this.main, relation, this.otherName),
        );

        forkJoin(observables).subscribe(() => {
            this.selectionChange.emit();
            if (this.select) {
                this.select.clear(false);
            }
        });
    }

    public pagination(event?: PageEvent) {
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

    public getDisplayFn(): (item: any) => string {
        if (this.displayWith) {
            return this.displayWith;
        }

        return item => (item ? item.fullName || item.name : '');
    }

    public openNaturalHierarchicSelector(): void {
        const selectAtKey = this.getSelectKey();

        if (!selectAtKey || !this.hierarchicSelectorConfig) {
            return;
        }

        const selected = {};

        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.hierarchicSelectorConfig,
            hierarchicSelection: selected,
            hierarchicFilters: this.hierarchicSelectorFilters,
            multiple: true,
        };

        this.hierarchicSelectorDialog
            .open(hierarchicConfig)
            .afterClosed()
            .subscribe(result => {
                if (result && result.hierarchicSelection !== undefined) {
                    const selection = result.hierarchicSelection[selectAtKey];
                    if (selection.length) {
                        this.addRelations(selection);
                    }
                }
            });
    }

    /**
     * Get list from database
     */
    private queryItems() {
        if (!this.service) {
            return;
        }

        this.loading = true;
        const queryRef = this.service.watchAll(this.variablesManager, this.ngUnsubscribe);
        queryRef.pipe(finalize(() => (this.loading = false))).subscribe(() => (this.loading = false));
        this.dataSource = new NaturalDataSource(queryRef);
    }

    private getSelectKey(): string | undefined {
        if (!this.hierarchicSelectorConfig) {
            return;
        }

        return this.hierarchicSelectorConfig.filter(c => !!c.selectableAtKey)[0].selectableAtKey;
    }
}
