import {Type} from '@angular/core';
import {type ExtractTallOne, type ExtractVall, UntypedModelService} from '../../../types/types';

export type NodeConfig<T extends UntypedModelService = UntypedModelService> = {
    /**
     * An AbstractModelService to be used to fetch items
     */
    service: Type<T>;

    /**
     * Whether this node is at the root of the tree (there can be multiple roots in one tree)
     */
    root?: boolean;

    /**
     * Additional filters applied in the query sent by getList function
     */
    filter?: ExtractVall<T>['filter'];

    /**
     * Key of the returned literal container models by config / service
     */
    selectableAtKey?: string;

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

export type NaturalHierarchicConfiguration<Nodes extends NodeConfig[]> = {
    /**
     * All possible nodes in the tree
     */
    nodes: Nodes;

    /**
     * All possible relations between nodes
     */
    relations: RelationConfig<Nodes>[];
};

export function nodeConfig<T extends UntypedModelService>(node: NodeConfig<T>): NodeConfig<T> {
    return node;
}

export function hierarchicConfig<Nodes extends NodeConfig[]>(
    nodes: Nodes,
    relations: RelationConfig<Nodes>[],
): NaturalHierarchicConfiguration<Nodes> {
    return {nodes: nodes, relations: relations};
}
