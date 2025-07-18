import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {clone} from 'es-toolkit';
import {defaults} from 'es-toolkit/compat';
import {NaturalSearchFacets} from '../../search/types/facet';
import {NaturalSearchSelections} from '../../search/types/values';
import {NaturalHierarchicConfiguration} from '../classes/hierarchic-configuration';
import {HierarchicFiltersConfiguration} from '../classes/hierarchic-filters-configuration';
import {OrganizedModelSelection} from '../hierarchic-selector/hierarchic-selector.service';
import {MatButtonModule} from '@angular/material/button';
import {NaturalHierarchicSelectorComponent} from '../hierarchic-selector/hierarchic-selector.component';

export type HierarchicDialogResult = {
    hierarchicSelection?: OrganizedModelSelection;
    searchSelections?: NaturalSearchSelections | null;
};

export type HierarchicDialogConfig = {
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
    hierarchicFilters?: HierarchicFiltersConfiguration | null;

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
    searchSelections?: NaturalSearchSelections | null;
};

@Component({
    templateUrl: './hierarchic-selector-dialog.component.html',
    styleUrl: './hierarchic-selector-dialog.component.scss',
    imports: [MatDialogModule, NaturalHierarchicSelectorComponent, MatButtonModule],
})
export class NaturalHierarchicSelectorDialogComponent {
    private dialogRef =
        inject<MatDialogRef<NaturalHierarchicSelectorDialogComponent, HierarchicDialogResult>>(MatDialogRef);

    /**
     * Set of hierarchic configurations to pass as attribute to HierarchicComponent
     */
    public config: HierarchicDialogConfig;

    /**
     * Natural search selections after initialisation
     */
    public searchSelectionsOutput: NaturalSearchSelections | undefined | null;

    public constructor() {
        const data = inject<HierarchicDialogConfig>(MAT_DIALOG_DATA);

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
