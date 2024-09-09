/*
 * Public API Surface of natural-search
 */
export type {NaturalDropdownData} from './dropdown-container/dropdown.service';
export type {FilterGroupConditionField, Filter} from './classes/graphql-doctrine.types';
export type {DropdownComponent} from './types/dropdown-component';
export type {FlagFacet, DropdownFacet, Facet, NaturalSearchFacets} from './types/facet';
export type {NaturalSearchSelections, NaturalSearchSelection} from './types/values';
export {NaturalDropdownRef} from './dropdown-container/dropdown-ref';
export {NATURAL_DROPDOWN_DATA} from './dropdown-container/dropdown.service';
export {toGraphQLDoctrineFilter} from './classes/graphql-doctrine';
export {fromUrl, toUrl, toNavigationParameters} from './classes/url';
export {replaceOperatorByName, wrapLike, wrapPrefix, wrapSuffix, replaceOperatorByField} from './classes/transformers';
export {NaturalSearchComponent} from './search/search.component';
