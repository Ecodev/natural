import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {clone} from 'es-toolkit';
import {defaults} from 'es-toolkit/compat';
import {NaturalSearchFacets} from '../../search/types/facet';
import {NaturalSearchSelections} from '../../search/types/values';
import {NaturalHierarchicConfiguration, type NodeConfig} from '../classes/hierarchic-configuration';
import {HierarchicFiltersConfiguration} from '../classes/hierarchic-filters-configuration';
import {OrganizedModelSelection} from '../hierarchic-selector/hierarchic-selector.service';
import {MatButton} from '@angular/material/button';
import {NaturalHierarchicSelectorComponent} from '../hierarchic-selector/hierarchic-selector.component';

export type HierarchicDialogResult = {
    hierarchicSelection?: OrganizedModelSelection;
    searchSelections?: NaturalSearchSelections | null;
};

export type HierarchicDialogConfig<Nodes extends NodeConfig[]> = {
    /**
     * Configuration to setup rules of hierarchy
     */
    hierarchicConfig: NaturalHierarchicConfiguration<Nodes>;

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
     * Allow to select all items with dedicated button
     */
    allowSelectAll?: boolean;

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
    imports: [MatDialogModule, NaturalHierarchicSelectorComponent, MatButton],
    templateUrl: './hierarchic-selector-dialog.component.html',
    styleUrl: './hierarchic-selector-dialog.component.scss',
})
export class NaturalHierarchicSelectorDialogComponent<Nodes extends NodeConfig[]> {
    private dialogRef =
        inject<MatDialogRef<NaturalHierarchicSelectorDialogComponent<Nodes>, HierarchicDialogResult>>(MatDialogRef);

    /**
     * Set of hierarchic configurations to pass as attribute to HierarchicComponent
     */
    public config: HierarchicDialogConfig<Nodes>;

    /**
     * Natural search selections after initialisation
     */
    public searchSelectionsOutput: NaturalSearchSelections | undefined | null;

    public constructor() {
        const data = inject<HierarchicDialogConfig<Nodes>>(MAT_DIALOG_DATA);

        this.config = defaults(data, {multiple: true});
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
