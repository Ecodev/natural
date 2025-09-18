import {inject, Injectable, Injector} from '@angular/core';
import {intersection} from 'es-toolkit';
import {first, forkJoin, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NaturalQueryVariablesManager, QueryVariables} from '../../../classes/query-variable-manager';
import {Literal, UntypedModelService} from '../../../types/types';
import {FilterGroupCondition} from '../../search/classes/graphql-doctrine.types';
import {NaturalHierarchicConfiguration} from '../classes/hierarchic-configuration';
import {
    HierarchicFilterConfiguration,
    HierarchicFiltersConfiguration,
} from '../classes/hierarchic-filters-configuration';
import {HierarchicModel, ModelNode} from '../classes/model-node';

export type OrganizedModelSelection = Record<string, any[]>;

type ContextualizedConfig<T extends UntypedModelService = UntypedModelService> = {
    configuration: NaturalHierarchicConfiguration;
    injectedService: T;
    variablesManager: NaturalQueryVariablesManager;
};

@Injectable({providedIn: 'root'})
export class NaturalHierarchicSelectorService {
    private readonly injector = inject(Injector);

    /**
     * We use cache because dataSource has nested data and would require recursive search
     */
    private readonly nodeCache = new Map<string, ModelNode>();

    public isTooBig(): boolean {
        return this.nodeCache.size >= 999;
    }

    /**
     * Retrieve elements from the server
     * Get root elements if node is null, or child elements if node is given
     */
    public getList(
        node: ModelNode | null = null,
        filters: HierarchicFiltersConfiguration | null = null,
        variables: QueryVariables | null = null,
        configurations: NaturalHierarchicConfiguration[],
    ): Observable<ModelNode[]> {
        const configs = this.getContextualizedConfigs(node, filters, variables, configurations);
        const observables = configs.map(c => c.injectedService.getAll(c.variablesManager));

        // Fire queries, and merge results, transforming apollo items into Node Object.
        return forkJoin(observables).pipe(
            map(results => {
                const listing: ModelNode[] = [];

                // For each result of an observable
                for (let i = 0; i < results.length; i++) {
                    // For each item of the result, convert into Node object
                    for (const item of results[i].items) {
                        const node = this.getOrCreateNode(item, configs[i].configuration);
                        listing.push(node);
                        this.countChildren(node, filters, configurations);

                        const isSelectable = node.config.isSelectableCallback
                            ? node.config.isSelectableCallback(node.model)
                            : true;
                        node.isSelectable = !!node.config.selectableAtKey && isSelectable;
                    }
                }

                return listing;
            }),
        );
    }

    public countChildren(
        node: ModelNode,
        filters: HierarchicFiltersConfiguration | null = null,
        configurations: NaturalHierarchicConfiguration[],
    ): void {
        const configs = this.getContextualizedConfigs(node, filters, null, configurations);
        const observables = configs.map(c => c.injectedService.count(c.variablesManager).pipe(first()));
        forkJoin(observables).subscribe(results => {
            node.isExpandable = results.reduce((total, length) => total + length, 0) > 0;
        });
    }

    private getContextualizedConfigs(
        node: ModelNode | null = null,
        contextFilters: HierarchicFiltersConfiguration | null = null,
        searchVariables: QueryVariables | null = null,
        configurations: NaturalHierarchicConfiguration[],
    ): ContextualizedConfig[] {
        const configsAndServices: ContextualizedConfig[] = [];

        // Considering the whole configuration may cause queries with no/wrong results we have imperatively to avoid !
        // e.g there are cross dependencies between equipments and taxonomies filters. Both have "parents" and
        // "taxonomies" filters... When clicking on a equipment, the configuration of taxonomies with match "parents"
        // filter, but use the id of the equipment To fix this, we should only consider configuration after the one
        // given by the node passed as argument. That would mean : no child can affect parent. That would mean :
        // sorting in the configuration have semantic/hierarchy implications
        const configs = node ? this.getNextConfigs(node.config, configurations) : configurations;

        const pagination = {pageIndex: 0, pageSize: 999};

        for (const config of configs) {
            const contextFilter = this.getFilterByService(config, contextFilters);
            const filter = this.getServiceFilter(node, config, contextFilter, !!searchVariables);

            if (!filter) {
                continue;
            }

            const variablesManager = new NaturalQueryVariablesManager();

            variablesManager.set('variables', {filter: filter, pagination: pagination});
            variablesManager.set('config-filter', {filter: config.filter});

            if (searchVariables) {
                variablesManager.set('natural-search', searchVariables);
            }

            const injectedService = this.injector.get(config.service);
            configsAndServices.push({
                configuration: config,
                injectedService: injectedService,
                variablesManager: variablesManager,
            });
        }

        return configsAndServices;
    }

    /**
     * Return models matching given FlatNodes
     * Returns a Literal of models grouped by their configuration attribute "selectableAtKey"
     */
    public toOrganizedSelection(
        nodes: ModelNode[],
        configurations: NaturalHierarchicConfiguration[],
    ): OrganizedModelSelection {
        const selection = configurations.reduce<Literal>((group, config) => {
            if (config.selectableAtKey) {
                group[config.selectableAtKey] = [];
            }
            return group;
        }, {});

        for (const node of nodes) {
            if (node.config.selectableAtKey) {
                selection[node.config.selectableAtKey].push(node.model);
            }
        }

        return selection;
    }

    /**
     * Transforms an OrganizedModelSelection into a list of ModelNodes
     */
    public fromOrganizedSelection(
        organizedModelSelection: OrganizedModelSelection,
        configurations: NaturalHierarchicConfiguration[],
    ): ModelNode[] {
        if (!organizedModelSelection) {
            return [];
        }

        const result: ModelNode[] = [];
        for (const selectableAtKey of Object.keys(organizedModelSelection)) {
            const config = this.getConfigurationBySelectableKey(selectableAtKey, configurations);
            if (config) {
                for (const model of organizedModelSelection[selectableAtKey]) {
                    result.push(this.getOrCreateNode(model, config));
                }
            }
        }
        return result;
    }

    /**
     * Checks that each configuration.selectableAtKey attribute is unique
     */
    public validateConfiguration(configurations: NaturalHierarchicConfiguration[]): void {
        const selectableAtKeyAttributes: string[] = [];
        for (const config of configurations) {
            if (config.selectableAtKey) {
                const keyIndex = selectableAtKeyAttributes.indexOf(config.selectableAtKey);

                if (keyIndex === -1 && config.selectableAtKey) {
                    selectableAtKeyAttributes.push(config.selectableAtKey);
                }

                // This behavior maybe dangerous in case we re-open hierarchical selector with the last returned config
                // having non-unique keys
                if (keyIndex < -1) {
                    console.warn('Invalid hierarchic configuration : selectableAtKey attribute should be unique');
                }
            }
        }
    }

    /**
     * Return configurations setup in the list after the given one
     */
    private getNextConfigs(
        nodeConfig: NaturalHierarchicConfiguration,
        configurations: NaturalHierarchicConfiguration[],
    ): NaturalHierarchicConfiguration[] {
        const configIndex = configurations.findIndex(c => c === nodeConfig);
        return configurations.slice(configIndex);
    }

    /**
     * Builds queryVariables filter for children query
     */
    private getServiceFilter(
        node: ModelNode | null,
        config: NaturalHierarchicConfiguration,
        contextFilter: HierarchicFilterConfiguration['filter'] | null = null,
        allDeeps = false,
    ): HierarchicFilterConfiguration['filter'] | null {
        const fieldCondition: FilterGroupCondition = {};

        // if no parent, filter empty elements
        if (!node) {
            if (!config.parentsRelationNames) {
                return contextFilter ? contextFilter : {};
            }

            if (!allDeeps) {
                config.parentsRelationNames.forEach(f => {
                    fieldCondition[f] = {empty: {}};
                });
            }
        } else {
            if (!node.config.childrenRelationNames || !config.parentsRelationNames) {
                return null;
            }

            const matchingFilters = intersection(node.config.childrenRelationNames, config.parentsRelationNames);
            if (!matchingFilters.length) {
                return null;
            }
            fieldCondition[matchingFilters[0]] = {have: {values: [node.model.id]}};
        }

        const filters = {groups: [{conditions: [fieldCondition]}]};

        // todo : is it right ? shouldn't it be managed with QueryVariablesManager's channels ? ?
        if (contextFilter) {
            filters.groups.push(...contextFilter.groups);
        }

        return filters;
    }

    /**
     * Return a context filter applicable to the service for given config
     *
     * @param config Applicable config
     * @param contextFilters List of context filters
     */
    private getFilterByService(
        config: NaturalHierarchicConfiguration,
        contextFilters: HierarchicFilterConfiguration[] | null,
    ): HierarchicFilterConfiguration['filter'] | null {
        if (!contextFilters || !config) {
            return null;
        }

        const filter = contextFilters.find(f => f.service === config.service);
        return filter ? filter.filter : null;
    }

    /**
     * Search in configurations.selectableAtKey attribute to find given key and return the configuration
     */
    private getConfigurationBySelectableKey(
        key: NaturalHierarchicConfiguration['selectableAtKey'],
        configurations: NaturalHierarchicConfiguration[],
    ): NaturalHierarchicConfiguration | null {
        if (!configurations) {
            return null;
        }

        return configurations.find(conf => conf.selectableAtKey === key) || null;
    }

    private getOrCreateNode(model: HierarchicModel, configurations: NaturalHierarchicConfiguration): ModelNode {
        const key = this.getCacheKey(model);
        let node = this.nodeCache.get(key);

        if (node) {
            return node;
        }

        node = new ModelNode(model, configurations);
        this.nodeCache.set(key, node);
        return node;
    }

    /**
     * Returns an identifier key for map cache
     * As many object types can be used, this function considers typename and ID to return something like document-123
     */
    private getCacheKey(model: HierarchicModel): string {
        return model.__typename + '-' + model.id;
    }

    public getAllFetchedNodes(): ModelNode[] {
        return Array.from(this.nodeCache.values());
    }
}
