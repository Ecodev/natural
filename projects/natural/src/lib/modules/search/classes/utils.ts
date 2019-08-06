import { Facet, NaturalSearchFacets } from '../types/facet';
import { NaturalSearchSelection } from '../types/values';

export function getFacetFromSelection(facets: NaturalSearchFacets | null,
                                      selection: NaturalSearchSelection): Facet | null {

    if (!facets) {
        return null;
    }

    // return config if found by alias, or if found by field name or null if not found
    return facets.find(c => c.name != null && c.name === selection.name) ||
           facets.find(v => v.field === selection.field) ||
           null;
}

export function deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}
