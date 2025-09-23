import {Component, inject} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FilterGroupConditionField} from '../../search/classes/graphql-doctrine.types';
import {NaturalDropdownRef} from '../../search/dropdown-container/dropdown-ref';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../types/dropdown-component';
import {Facet, NaturalSearchFacets} from '../types/facet';
import {MatListItem, MatNavList} from '@angular/material/list';

/**
 * Configuration for facet selection
 */
export type FacetSelectorConfiguration = {
    facets: NaturalSearchFacets;
};

@Component({
    imports: [MatNavList, MatListItem],
    templateUrl: './facet-selector.component.html',
    styleUrl: './facet-selector.component.scss',
})
export class FacetSelectorComponent implements DropdownComponent {
    public readonly data = inject<NaturalDropdownData<FacetSelectorConfiguration>>(NATURAL_DROPDOWN_DATA);
    protected dropdownRef = inject(NaturalDropdownRef);

    // Never has a real value
    public readonly renderedValue = new BehaviorSubject<string>('');
    public facets = this.data.configuration.facets;
    public selection: Facet | null = null;

    /**
     * Get value, including rich object types
     */
    public getCondition(): FilterGroupConditionField {
        return {};
    }

    /**
     * Allow to close the dropdown with a valid value
     */
    public close(): void {
        if (this.selection) {
            this.dropdownRef.close({
                condition: {},
                facet: this.selection,
            });
        }
    }

    public isValid(): boolean {
        return !!this.selection;
    }

    public isDirty(): boolean {
        return true;
    }
}
