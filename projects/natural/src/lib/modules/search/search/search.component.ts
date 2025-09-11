import {Component, inject, Input, OnChanges, output, signal, input} from '@angular/core';
import {deepClone} from '../classes/utils';
import {NaturalSearchFacets} from '../types/facet';
import {GroupSelections, NaturalSearchSelections} from '../types/values';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs';
import {MatDividerModule} from '@angular/material/divider';
import {NaturalIconDirective} from '../../icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {NaturalGroupComponent} from '../group/group.component';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'natural-search',
    imports: [
        CommonModule,
        NaturalGroupComponent,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        NaturalIconDirective,
        MatDividerModule,
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
})
export class NaturalSearchComponent implements OnChanges {
    private readonly breakpointObserver = inject(BreakpointObserver);

    /**
     * Placeholder for last input (the free search input)
     */
    public readonly placeholder = input($localize`Rechercher`);

    /**
     * Exhaustive list of facets to be used in this <natural-search>
     */
    @Input() public facets: NaturalSearchFacets = [];

    /**
     * Whether to allow end-user to create multiple `OR` groups
     */
    public readonly multipleGroups = input(false);

    /**
     * Text display in the dropdown to select the facet
     */
    public readonly dropdownTitle = input('');

    /**
     * Emits when some selection has been setted by the user
     */
    public readonly selectionChange = output<NaturalSearchSelections>();

    /**
     * Cleaned inputted selections. Allow valid selections to be manipulated inside component
     */
    readonly #innerSelections = signal<NaturalSearchSelections>([[]]);

    /**
     * Cleaned inputted selections. This public API is useful because `selectionChange` does not emit changes made via `[selections]`
     */
    public readonly innerSelections = this.#innerSelections.asReadonly();

    /**
     * Input to display at component initialisation
     */
    @Input()
    public set selections(selections: NaturalSearchSelections) {
        this.#innerSelections.set(selections?.[0] ? deepClone(selections) : [[]]);
    }

    public readonly isMobile = this.breakpointObserver.observe(Breakpoints.XSmall).pipe(map(result => result.matches));

    public ngOnChanges(): void {
        if (!this.facets) {
            this.facets = [];
        }
    }

    public updateGroup(groupSelections: GroupSelections, groupIndex: number): void {
        const selections = [...this.#innerSelections()];
        for (let i = 0; i < groupSelections.length; i++) {
            selections[groupIndex][i] = groupSelections[i];
        }
        selections[groupIndex].length = groupSelections.length;

        this.#notify(selections);
    }

    public addGroup(): void {
        const selections = [...this.#innerSelections()];
        selections.push([]);

        this.#notify(selections);
    }

    public removeGroup(index: number): void {
        const selections = [...this.#innerSelections()];
        selections.splice(index, 1);

        this.#notify(selections);
    }

    public clear(): void {
        this.#notify([[]]);
    }

    #notify(selections: NaturalSearchSelections): void {
        this.#innerSelections.set(selections);
        this.selectionChange.emit(selections);
    }
}
