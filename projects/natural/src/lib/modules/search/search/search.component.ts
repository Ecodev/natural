import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {deepClone} from '../classes/utils';
import {NaturalSearchFacets} from '../types/facet';
import {NaturalSearchSelections} from '../types/values';

@Component({
    selector: 'natural-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class NaturalSearchComponent implements OnChanges {
    /**
     * Placeholder for last input (the free search input)
     */
    @Input() placeholder = 'Rechercher';

    /**
     * Exhaustive list of facets to be used in this <natural-search>
     */
    @Input() facets: NaturalSearchFacets = [];

    /**
     * Whether to allow end-user to create multiple `OR` groups
     */
    @Input() multipleGroups = false;

    /**
     * Emits when some selection has been setted by the user
     */
    @Output() selectionChange = new EventEmitter<NaturalSearchSelections>();

    /**
     * Cleaned inputed selections. Grants valid selections to be manipulated inside component
     */
    public innerSelections: NaturalSearchSelections = [[]];

    /**
     * Input to display at component initialisation
     */
    @Input() set selections(selections: NaturalSearchSelections) {
        this.innerSelections = selections && selections[0] ? deepClone(selections) : [[]];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.facets) {
            this.facets = [];
        }
    }

    public updateGroup(groupSelections, groupIndex): void {
        for (let i = 0; i < groupSelections.length; i++) {
            this.innerSelections[groupIndex][i] = groupSelections[i];
        }
        this.innerSelections[groupIndex].length = groupSelections.length;
        this.selectionChange.emit(this.innerSelections);
    }

    public addGroup(): void {
        this.innerSelections.push([]);
        this.selectionChange.emit(this.innerSelections);
    }

    public removeGroup(index: number): void {
        this.innerSelections.splice(index, 1);
        this.selectionChange.emit(this.innerSelections);
    }

    public clear(): void {
        this.innerSelections = [[]];
        this.selectionChange.emit([[]]);
    }
}
