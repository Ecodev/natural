import {Type} from '@angular/core';
import {PaginatedData} from '../../../classes/data-source';
import {QueryVariables} from '../../../classes/query-variable-manager';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {type ExtractTallOne, type ExtractVall, Literal} from '../../../types/types';

// More globally in types.ts ?
export type ListableModelService = NaturalAbstractModelService<
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
>;

// Remove = ListableModelService ? keep the extends part only ?
export type NodeConfig<T extends ListableModelService = ListableModelService> = {
    /**
     * An AbstractModelService to be used to fetch items
     */
    service: Type<T>;

    /**
     * Additional filters applied in the query sent by getList function
     */
    filter?: ExtractVall<T>['filter'];

    /**
     * Displayed icon for items retrieved for that config
     */
    icon?: string;

    /**
     * Callback function that returns boolean. If true the item is selectable, if false, it's not.
     * If missing, item is selectable.
     *
     * In fact, this means isDisabled. Also applies to unselect.
     */
    isSelectableCallback?: (item: ExtractTallOne<T>) => boolean;

    /**
     * Functions that receives a model and returns a string for display value
     *
     * If missing, fallback on global `NaturalHierarchicSelectorComponent.displayWith`
     */
    displayWith?: (item: ExtractTallOne<T>) => string;
};

type RelationConfig<Nodes extends NodeConfig[]> = {
    /**
     * The parent node, eg: ChapterService
     */
    parent: Nodes[number];

    /**
     * The child node, eg: QuestionService
     */
    child: Nodes[number];

    /**
     * One of the keys of the `FilterGroupCondition` for the child service, to filter children by their parent(s)
     *
     * Those will be used directly to build filter to fetch children, so they must be
     * valid API `FilterGroupCondition` keys for the given child service.
     *
     * Eg: given the `QuestionService`, possible names would be:
     *
     * - "chapter" to filter the questions by their chapter
     * - "parent" to filter the questions by their parent question
     */
    field: string;
};

export type NaturalHierarchicConfiguration<
    Node extends NodeConfig[] = NodeConfig[],
    Selectables extends OrganizedSelectableConfigs<Node> = OrganizedSelectableConfigs<Node>,
> = {
    /**
     * All possible nodes in the tree
     */
    nodes: Node;

    /**
     * All possible relations between nodes
     */
    relations: RelationConfig<Node>[];

    /**
     * List of nodes used for the root of the tree
     */
    roots: Node[number][];

    /**
     * List of nodes for selectable elements, organized by key.
     */
    selectables: Selectables;
};

export function nodeConfig<T extends ListableModelService>(node: NodeConfig<T>): NodeConfig<T> {
    return node;
}

export function hierarchicConfig<
    const Nodes extends NodeConfig[],
    const Selectables extends OrganizedSelectableConfigs<Nodes>,
>(
    nodes: Nodes,
    roots: Nodes[number][],
    selectables: Selectables,
    relations: RelationConfig<Nodes>[],
): NaturalHierarchicConfiguration<Nodes, Selectables> {
    return {nodes, roots, selectables, relations};
}

// Outputs / Resulting selections

/**
 * Equivalent to `OrganizedSelections` but for the config (input) side.
 * List of selectable nodes (services) organized by key.
 */
export type OrganizedSelectableConfigs<Nodes extends NodeConfig[]> = Record<string, Nodes[number][]>;

/**
 * The model type of a single node config, eg: NodeConfig<QuestionService> → Question
 */
type Model<SingleNodeConfig extends NodeConfig> = SingleNodeConfig extends NodeConfig<infer T>
    ? ExtractTallOne<T>
    : never;

/**
 * The models selected for a single selectable slot (one key of `selectables`)
 */
export type Selections<Nodes extends NodeConfig[]> = Model<Nodes[number]>[];

/**
 * All selections, organized by key, typed from the configuration's `selectables`.
 *
 * Replaces the old `OrganizedModelSelection = Record<string, any[]>`.
 */
export type OrganizedSelections<Selectables extends OrganizedSelectableConfigs<any> = OrganizedSelectableConfigs<any>> = {
    [Key in keyof Selectables]: Selections<Selectables[Key]>;
};
