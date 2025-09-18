import {SelectionModel} from '@angular/cdk/collections';
import {Component, inject, input, OnChanges, OnInit, output, SimpleChanges} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioButton} from '@angular/material/radio';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {QueryVariables} from '../../../classes/query-variable-manager';
import {replaceObjectKeepingReference} from '../../../classes/utility';
import {NaturalIconDirective} from '../../icon/icon.directive';
import {toGraphQLDoctrineFilter} from '../../search/classes/graphql-doctrine';
import {NaturalSearchComponent} from '../../search/search/search.component';
import {NaturalSearchFacets} from '../../search/types/facet';
import {NaturalSearchSelections} from '../../search/types/values';
import {NaturalHierarchicConfiguration} from '../classes/hierarchic-configuration';
import {HierarchicFiltersConfiguration} from '../classes/hierarchic-filters-configuration';
import {ModelNode} from '../classes/model-node';
import {NaturalHierarchicSelectorService, OrganizedModelSelection} from './hierarchic-selector.service';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'natural-hierarchic-selector',
    imports: [
        NaturalSearchComponent,
        MatProgressSpinnerModule,
        MatTreeModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        MatCheckboxModule,
        MatChipsModule,
        MatTooltipModule,
        MatRadioButton,
        NgTemplateOutlet,
    ],
    templateUrl: './hierarchic-selector.component.html',
    styleUrl: './hierarchic-selector.component.scss',
    providers: [NaturalHierarchicSelectorService],
})
export class NaturalHierarchicSelectorComponent implements OnInit, OnChanges {
    protected readonly hierarchicSelectorService = inject(NaturalHierarchicSelectorService);

    /**
     * Function that receives a model and returns a string for display value
     */
    public readonly displayWith = input<(item: any) => string>();

    /**
     * Config for items and relations arrangement
     */
    public readonly config = input.required<NaturalHierarchicConfiguration[]>();

    /**
     * If multiple or single item selection
     */
    public readonly multiple = input(false);

    /**
     * Selected items
     * Organized by key, containing each an array of selected items of same type
     */
    public readonly selected = input<OrganizedModelSelection>({});

    /**
     * Filters that apply to each query
     */
    public readonly filters = input<HierarchicFiltersConfiguration | null>();

    /**
     * Search facets
     */
    public readonly searchFacets = input<NaturalSearchFacets>([]);

    /**
     * Selections to apply on natural-search on component initialisation
     */
    public readonly searchSelections = input<NaturalSearchSelections>([]);

    /**
     * Select all fetched items of the current search result
     *
     * Use very carefully as recursivity is ignored. The selection includes children (if any) even if the child list has been closed
     *
     * Should be used __only__ for non-recursive use cases. Avoid with recursive because it's not intuitive for end user
     */
    public readonly allowSelectAll = input(false);

    /**
     * Emits when natural-search selections change
     */
    public readonly searchSelectionChange = output<NaturalSearchSelections>();

    /**
     * Emits selection change
     * Returns a Literal where selected models are organized by key
     */
    public readonly selectionChange = output<OrganizedModelSelection>();

    /**
     * List selected items (right listing)
     */
    protected selection!: SelectionModel<ModelNode>;

    /**
     * Data source for result listing (left listing)
     */
    protected readonly dataSource = new MatTreeNestedDataSource<ModelNode>();

    public loading = false;

    /**
     * Angular OnChange implementation
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.selected && !changes.selected.firstChange) {
            this.updateInnerSelection(this.selected());
        }

        if (changes.filters && !changes.filters.firstChange) {
            this.loadRoot();
        }
    }

    public ngOnInit(): void {
        this.hierarchicSelectorService.validateConfiguration(this.config());

        this.selection = new SelectionModel<any>(this.multiple());

        // Prevent empty screen on first load and init NaturalHierarchicSelectorService with inputted configuration
        let variables;
        const searchSelections = this.searchSelections();
        if (searchSelections.some(s => s.length)) {
            variables = {filter: toGraphQLDoctrineFilter(this.searchFacets(), searchSelections)};
        }

        this.loadRoot(variables);

        // OrganizedSelection into list usable by template
        this.updateInnerSelection(this.selected());
    }

    /**
     * Toggle selection of a node, considering if multiple selection is activated or not
     */
    public toggleSelection(node: ModelNode): void {
        this.selection.toggle(node);
        this.updateSelection();
    }

    protected selectAll(): void {
        this.hierarchicSelectorService.getAllFetchedNodes().forEach(node => {
            this.selection.select(node);
        });
        this.updateSelection();
    }

    /**
     * When unselecting an element from the mat-chips, it can be deep in the hierarchy, and the tree element may not
     * exist...
     * ... but we still need to remove the element from the mat-chips list.
     */
    public unselect(node: ModelNode): void {
        this.selection.deselect(node);
        this.updateSelection();
    }

    protected getDisplayFn(config: NaturalHierarchicConfiguration): (item: any) => string {
        if (config.displayWith) {
            return config.displayWith;
        }

        const displayWith = this.displayWith();
        if (displayWith) {
            return displayWith;
        }

        return item => (item ? item.fullName || item.name : '');
    }

    private loadRoot(searchVariables?: QueryVariables): void {
        this.loading = true;
        this.hierarchicSelectorService
            .getList(null, this.filters(), searchVariables, this.config())
            .pipe(finalize(() => (this.loading = false)))
            .subscribe(items => {
                this.dataSource.data = items;
            });
    }

    public search(selections: NaturalSearchSelections): void {
        this.searchSelectionChange.emit(selections);
        if (selections.some(s => s.length)) {
            const variables = {filter: toGraphQLDoctrineFilter(this.searchFacets(), selections)};
            this.hierarchicSelectorService.getList(null, this.filters(), variables, this.config()).subscribe(items => {
                this.dataSource.data = items;
            });
        } else {
            this.loadRoot();
        }
    }

    /**
     * Get list of children, considering given FlatNode id as a parent.
     * Mark loading status individually on nodes.
     */
    public loadChildren(node: ModelNode, contextFilter: HierarchicFiltersConfiguration | null = null): void {
        if (node.hasChildren) {
            return;
        }

        node.isLoading = true;
        this.hierarchicSelectorService
            .getList(node, contextFilter, null, this.config())
            .pipe(finalize(() => (node.isLoading = false)))
            .subscribe(items => node.childrenChange.next(items));
    }

    protected childrenAccessor = (node: ModelNode): Observable<ModelNode[]> => {
        return node.children;
    };

    /**
     * Sync inner selection (tree and mat-chips) according to selected input attribute
     */
    private updateInnerSelection(selected: OrganizedModelSelection): void {
        // Transform an OrganizedModelSelection into a ModelNode list that is used in the selected zone of the component (see template)
        const selectedNodes = this.hierarchicSelectorService.fromOrganizedSelection(selected, this.config());
        this.selection.clear();
        for (const node of selectedNodes) {
            this.selection.select(node);
        }
    }

    /**
     * Transform the given elements into the organized selection that is emitted to output
     */
    private updateSelection(): void {
        const organizedFlatNodesSelection = this.hierarchicSelectorService.toOrganizedSelection(
            this.selection.selected,
            this.config(),
        );
        replaceObjectKeepingReference(this.selected(), organizedFlatNodesSelection);
        this.selectionChange.emit(organizedFlatNodesSelection);
    }
}
