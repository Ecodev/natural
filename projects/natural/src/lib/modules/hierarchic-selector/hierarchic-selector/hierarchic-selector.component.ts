import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {Component, DestroyRef, inject, input, Input, OnChanges, OnInit, output, SimpleChanges} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {QueryVariables} from '../../../classes/query-variable-manager';
import {replaceObjectKeepingReference} from '../../../classes/utility';
import {Literal} from '../../../types/types';
import {NaturalIconDirective} from '../../icon/icon.directive';
import {toGraphQLDoctrineFilter} from '../../search/classes/graphql-doctrine';
import {NaturalSearchComponent} from '../../search/search/search.component';
import {NaturalSearchFacets} from '../../search/types/facet';
import {NaturalSearchSelections} from '../../search/types/values';
import {HierarchicFlatNode} from '../classes/flat-node';
import {NaturalHierarchicConfiguration} from '../classes/hierarchic-configuration';
import {HierarchicFiltersConfiguration} from '../classes/hierarchic-filters-configuration';
import {HierarchicModelNode} from '../classes/model-node';
import {NaturalHierarchicSelectorService, OrganizedModelSelection} from './hierarchic-selector.service';

@Component({
    selector: 'natural-hierarchic-selector',
    imports: [
        NaturalSearchComponent,
        CommonModule,
        MatProgressSpinnerModule,
        MatTreeModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        MatCheckboxModule,
        MatChipsModule,
    ],
    templateUrl: './hierarchic-selector.component.html',
    styleUrl: './hierarchic-selector.component.scss',
    providers: [NaturalHierarchicSelectorService],
})
export class NaturalHierarchicSelectorComponent implements OnInit, OnChanges {
    private readonly destroyRef = inject(DestroyRef);
    private readonly hierarchicSelectorService = inject(NaturalHierarchicSelectorService);

    /**
     * Function that receives a model and returns a string for display value
     */
    @Input() public displayWith?: (item: any) => string;

    /**
     * Config for items and relations arrangement
     */
    @Input({required: true}) public config!: NaturalHierarchicConfiguration[];

    /**
     * If multiple or single item selection
     */
    @Input() public multiple = false;

    /**
     * Selected items
     * Organized by key, containing each an array of selected items of same type
     */
    @Input() public selected: OrganizedModelSelection = {};

    /**
     * Whether selectable elements can be unselected
     */
    @Input() public allowUnselect = true;

    /**
     * Filters that apply to each query
     */
    @Input() public filters?: HierarchicFiltersConfiguration | null;

    /**
     * Search facets
     */
    @Input() public searchFacets: NaturalSearchFacets = [];

    /**
     * Selections to apply on natural-search on component initialisation
     */
    @Input() public searchSelections: NaturalSearchSelections = [];

    /**
     * Select all fetched items of the current search result
     *
     * Use very carefully as recursivity is ignored. The selection includes children (if any) even if the child list has been closed
     *
     * Should be used __only__ for non-recursive use cases. Avoid with recursive because it's not intuitive for end user
     */
    public readonly allowSelectAll = input<boolean>(false);

    /**
     * Emits when natural-search selections change
     */
    public readonly searchSelectionChange = output<NaturalSearchSelections>();

    /**
     * Inner representation of selected @Input() to allow flat listing as mat-chip.
     */
    public selectedNodes: HierarchicModelNode[] = [];

    /**
     * Emits selection change
     * Returns a Literal where selected models are organized by key
     */
    public readonly selectionChange = output<OrganizedModelSelection>();

    /**
     * Controller for nodes selection
     */
    public flatNodesSelection!: SelectionModel<HierarchicFlatNode>;

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    public treeControl!: FlatTreeControl<HierarchicFlatNode>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    public treeFlattener!: MatTreeFlattener<HierarchicModelNode, HierarchicFlatNode>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    public dataSource!: MatTreeFlatDataSource<HierarchicModelNode, HierarchicFlatNode>;

    public loading = false;

    /**
     * Cache for transformed nodes
     */
    private flatNodeMap = new Map<string, HierarchicFlatNode>();

    /**
     * Angular OnChange implementation
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.selected && !changes.selected.firstChange) {
            this.updateInnerSelection(this.selected);
        }

        if (changes.filters && !changes.filters.firstChange) {
            this.loadRoots();
        }
    }

    /**
     * Angular OnInit implementation
     */
    public ngOnInit(): void {
        // Init tree checkbox selectors
        this.flatNodesSelection = new SelectionModel<any>(this.multiple);

        // Tree controllers and manipulators
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        this.treeFlattener = new MatTreeFlattener(
            this.transformer(),
            this.getLevel(),
            this.isExpandable(),
            this.getChildren(),
        );
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        this.treeControl = new FlatTreeControl<HierarchicFlatNode>(this.getLevel(), this.isExpandable());

        // The dataSource contains a nested ModelNodes list. Each ModelNode has a child attribute that returns an observable.
        // The dataSource contains a flat representation of the nested ModelNodes that is generated by the treeFlattener related functions
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Update dataSource when receiving new list -> we assign the whole tree
        // The treeControl and treeFlattener will generate the displayed tree
        this.hierarchicSelectorService.dataChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(data => (this.dataSource.data = data));

        // Prevent empty screen on first load and init NaturalHierarchicSelectorService with inputted configuration
        let variables;
        if (this.searchSelections.some(s => s.length)) {
            variables = {filter: toGraphQLDoctrineFilter(this.searchFacets, this.searchSelections)};
        }
        this.loadRoots(variables);

        // OrganizedSelection into list usable by template
        this.updateInnerSelection(this.selected);
    }

    /**
     * Toggle selection of a FlatNode, considering if multiple selection is activated or not
     */
    public toggleFlatNode(flatNode: HierarchicFlatNode): void {
        if (this.multiple) {
            // Is multiple allowed, just toggle element
            if (this.flatNodesSelection.isSelected(flatNode)) {
                this.unselectFlatNode(flatNode);
            } else {
                this.selectFlatNode(flatNode);
            }
        } else if (!this.multiple) {
            if (this.flatNodesSelection.isSelected(flatNode)) {
                this.unselectSingleFlatNode();
            } else {
                // If not multiple, and we want to select an element, unselect everything before to keep a single selection
                this.selectSingleFlatNode(flatNode);
            }
        }
    }

    protected selectAll(): void {
        this.flatNodeMap.forEach(flatNode => {
            if (!this.isNodeSelected(flatNode.node)) {
                this.selectFlatNode(flatNode);
            }
        });
        this.updateSelection(this.selectedNodes);
    }

    /**
     * When unselecting an element from the mat-chips, it can be deep in the hierarchy, and the tree element may not exist...
     * ... but we still need to remove the element from the mat-chips list.
     */
    public unselectModelNode(node: HierarchicModelNode): void {
        const flatNode = this.getFlatNode(node);
        if (flatNode) {
            this.unselectFlatNode(flatNode);
        } else {
            // Remove from chips list only if no flatNode, because unselectFlatNode() already deals with it.
            this.removeModelNode(node);
            this.updateSelection(this.selectedNodes);
        }
    }

    public isNodeTogglable(flatNode: HierarchicFlatNode): boolean {
        if (this.isNodeSelected(flatNode.node)) {
            return flatNode.deselectable;
        } else {
            return flatNode.selectable;
        }
    }

    private getDisplayFn(config: NaturalHierarchicConfiguration): (item: any) => string {
        if (config.displayWith) {
            return config.displayWith;
        }

        if (this.displayWith) {
            return this.displayWith;
        }

        return item => (item ? item.fullName || item.name : '');
    }

    public loadChildren(flatNode: HierarchicFlatNode): void {
        if (this.treeControl.isExpanded(flatNode)) {
            this.hierarchicSelectorService.loadChildren(flatNode, this.filters);
        }
    }

    /**
     * Created to collapse all children when closing a parent, but not sure it's good.
     */
    // public loadChildren(flatNode: HierarchicFlatNode) {
    //     if (this.treeControl.isExpanded(flatNode)) {
    //
    //         const cachedFlatNode = this.getFlatNode(flatNode.node);
    //         if (cachedFlatNode) {
    //             this.hierarchicSelectorService.loadChildren(cachedFlatNode, this.filters);
    //
    //             // Close children
    //             cachedFlatNode.node.children.forEach(child => {
    //                 const childNode = this.getFlatNode(child);
    //                 if (childNode) {
    //                     this.treeControl.collapse(childNode);
    //                 }
    //             });
    //         }
    //     }
    // }

    private getChildren(): (node: HierarchicModelNode) => Observable<HierarchicModelNode[]> {
        return (node: HierarchicModelNode): Observable<HierarchicModelNode[]> => {
            return node.childrenChange;
        };
    }

    /**
     * Transforms a HierarchicModelNode into a FlatNode
     */
    private transformer(): (node: HierarchicModelNode, level: number) => HierarchicFlatNode {
        return (node: HierarchicModelNode, level: number) => {
            return this.getOrCreateFlatNode(node, level);
        };
    }

    /**
     * Return deep of the node in the tree
     */
    private getLevel(): (node: HierarchicFlatNode) => number {
        return (node: HierarchicFlatNode) => {
            return node.level;
        };
    }

    /**
     * Is always expandable because we load on demand, we don't know if there are children yet
     */
    private isExpandable(): (node: HierarchicFlatNode) => boolean {
        return (node: HierarchicFlatNode) => {
            return node.expandable;
        };
    }

    private getOrCreateFlatNode(node: HierarchicModelNode, level: number): HierarchicFlatNode {
        // Return FlatNode if exists
        const flatNode = this.getFlatNode(node);
        if (flatNode) {
            return flatNode;
        }

        // Return new FlatNode
        return this.createFlatNode(node, level);
    }

    public search(selections: NaturalSearchSelections): void {
        this.searchSelectionChange.emit(selections);
        if (selections.some(s => s.length)) {
            const variables = {filter: toGraphQLDoctrineFilter(this.searchFacets, selections)};
            this.hierarchicSelectorService.search(variables, this.filters);
        } else {
            this.loadRoots();
        }
    }

    private loadRoots(searchVariables?: QueryVariables): void {
        this.loading = true;
        this.flatNodeMap = new Map<string, HierarchicFlatNode>();
        this.hierarchicSelectorService
            .init(this.config, this.filters, searchVariables || null)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe();
    }

    /**
     * Sync inner selection (tree and mat-chips) according to selected input attribute
     */
    private updateInnerSelection(selected: OrganizedModelSelection): void {
        // Transform an OrganizedModelSelection into a ModelNode list that is used in the selected zone of the component (see template)
        this.selectedNodes = this.hierarchicSelectorService.fromOrganizedSelection(selected);

        this.flatNodesSelection.clear();
        for (const node of this.selectedNodes) {
            const flatNode = this.getFlatNode(node);
            if (flatNode) {
                this.flatNodesSelection.select(flatNode);
            }
        }
    }

    /**
     * Unselect a node, keeping the rest of the selected untouched
     */
    private unselectFlatNode(flatNode: HierarchicFlatNode): void {
        this.flatNodesSelection.deselect(flatNode);
        this.removeModelNode(flatNode.node);
        this.updateSelection(this.selectedNodes);
    }

    /**
     * Remove a node from chip lists
     */
    private removeModelNode(node: HierarchicModelNode): void {
        const key = this.getMapKey(node.model);
        const selectionIndex = this.selectedNodes.findIndex(n => this.getMapKey(n.model) === key);
        this.selectedNodes.splice(selectionIndex, 1);
    }

    /**
     * Select a node, keeping th rest of the selected untouched
     */
    private selectFlatNode(flatNode: HierarchicFlatNode): void {
        this.flatNodesSelection.select(flatNode);
        this.selectedNodes.push(flatNode.node);
        this.updateSelection(this.selectedNodes);
    }

    /**
     * Clear all selected and select the given node
     */
    private selectSingleFlatNode(flatNode: HierarchicFlatNode): void {
        this.flatNodesSelection.clear();
        this.flatNodesSelection.select(flatNode);
        this.selectedNodes = [flatNode.node];
        this.updateSelection(this.selectedNodes);
    }

    /**
     * Clear all selected and select the given node
     */
    private unselectSingleFlatNode(): void {
        this.flatNodesSelection.clear();
        this.selectedNodes = [];
        this.updateSelection(this.selectedNodes);
    }

    /**
     * Transform the given elements into the organized selection that is emitted to output
     */
    private updateSelection(selected: HierarchicModelNode[]): void {
        const organizedFlatNodesSelection = this.hierarchicSelectorService.toOrganizedSelection(selected);
        replaceObjectKeepingReference(this.selected, organizedFlatNodesSelection);
        this.selectionChange.emit(organizedFlatNodesSelection);
    }

    private isNodeSelected(modelNode: HierarchicModelNode): boolean {
        const key = this.getMapKey(modelNode.model);

        return this.selectedNodes.some(n => this.getMapKey(n.model) === key);
    }

    private getFlatNode(node: HierarchicModelNode): HierarchicFlatNode | null {
        const key = this.getMapKey(node.model);
        return this.flatNodeMap.get(key) || null;
    }

    private createFlatNode(node: HierarchicModelNode, level: number): HierarchicFlatNode {
        const key = this.getMapKey(node.model);
        const name = this.getDisplayFn(node.config)(node.model);
        const expandable = false;
        const isCustomSelectable = node.config.isSelectableCallback
            ? node.config.isSelectableCallback(node.model)
            : true;
        const isSelectable = !!node.config.selectableAtKey && isCustomSelectable;

        const flatNode = new HierarchicFlatNode(node, name, level, expandable, isSelectable);

        this.hierarchicSelectorService.countItems(flatNode, this.filters);

        // Mark node as selected if needed (checks the selected processed input)
        if (this.isNodeSelected(node)) {
            if (!this.allowUnselect) {
                flatNode.deselectable = false;
            }
            this.flatNodesSelection.select(flatNode);
        }

        // Cache FlatNode
        this.flatNodeMap.set(key, flatNode);

        return flatNode;
    }

    /**
     * Returns an identifier key for map cache
     * As many object types can be used, this function considers typename and ID to return something like document-123
     */
    private getMapKey(model: Literal): string {
        return model.__typename + '-' + model.id;
    }
}
