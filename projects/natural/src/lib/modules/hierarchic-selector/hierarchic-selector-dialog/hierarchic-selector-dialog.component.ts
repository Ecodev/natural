import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {clone, defaults} from 'lodash-es';
import {NaturalSearchFacets} from '../../search/types/facet';
import {NaturalSearchSelections} from '../../search/types/values';
import {NaturalHierarchicConfiguration} from '../classes/hierarchic-configuration';
import {HierarchicFiltersConfiguration} from '../classes/hierarchic-filters-configuration';
import {OrganizedModelSelection} from '../hierarchic-selector/hierarchic-selector.service';

export interface HierarchicDialogResult {
    hierarchicSelection?: OrganizedModelSelection;
    searchSelections?: NaturalSearchSelections;
}

export interface HierarchicDialogConfig {
    /**
     * Configuration to setup rules of hierarchy
     */
    hierarchicConfig: NaturalHierarchicConfiguration[];

    /**
     * Selected items when HierarchicComponent initializes
     */
    hierarchicSelection?: OrganizedModelSelection;

    /**
     * Filters to apply on queries (when opening new level of hierarchy)
     */
    hierarchicFilters?: HierarchicFiltersConfiguration;

    /**
     * Multiple selection if true or single selection if false
     */
    multiple?: boolean;

    /**
     * Allow to validate selection with no items checked
     */
    allowUnselect?: boolean;

    /**
     * Facets for natural-search in HierarchicComponent
     */
    searchFacets?: NaturalSearchFacets;

    /**
     * Selections of natural search to initialize on HierarchicComponent initialisation
     */
    searchSelections?: NaturalSearchSelections;
}

@Component({
    templateUrl: './hierarchic-selector-dialog.component.html',
    styleUrls: ['./hierarchic-selector-dialog.component.scss'],
})
export class NaturalHierarchicSelectorDialogComponent {
    /**
     * Set of hierarchic configurations to pass as attribute to HierarchicComponent
     */
    public config: HierarchicDialogConfig;

    /**
     * Natural search selections after initialisation
     */
    public searchSelectionsOutput: NaturalSearchSelections | undefined;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: HierarchicDialogConfig,
        public dialogRef: MatDialogRef<NaturalHierarchicSelectorDialogComponent, HierarchicDialogResult>,
    ) {
        this.config = defaults(data, {multiple: true, allowUnselect: true});
        this.searchSelectionsOutput = this.config.searchSelections;
    }

    public close(selected: OrganizedModelSelection | undefined): void {
        const result: HierarchicDialogResult = {
            hierarchicSelection: clone(selected),
            searchSelections: clone(this.searchSelectionsOutput),
        };

        this.dialogRef.close(result);
    }
}
