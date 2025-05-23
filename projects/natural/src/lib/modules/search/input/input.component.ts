import {
    Component,
    ComponentRef,
    createComponent,
    createEnvironmentInjector,
    ElementRef,
    EnvironmentInjector,
    HostListener,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    StaticProvider,
    viewChild,
    output,
} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn} from '@angular/forms';
import {ErrorStateMatcher, MatRipple, MatRippleModule} from '@angular/material/core';
import {FilterGroupConditionField} from '../classes/graphql-doctrine.types';
import {getFacetFromSelection} from '../classes/utils';
import {NaturalDropdownRef} from '../dropdown-container/dropdown-ref';
import {
    NATURAL_DROPDOWN_DATA,
    NaturalDropdownData,
    NaturalDropdownService,
} from '../dropdown-container/dropdown.service';
import {FacetSelectorComponent, FacetSelectorConfiguration} from '../facet-selector/facet-selector.component';
import {DropdownComponent} from '../types/dropdown-component';
import {DropdownFacet, Facet, FlagFacet, NaturalSearchFacets} from '../types/facet';
import {DropdownResult, NaturalSearchSelection} from '../types/values';
import {MatButtonModule} from '@angular/material/button';
import {NaturalIconDirective} from '../../icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

// Required to check invalid fields when initializing natural-search
class AlwaysErrorStateMatcher implements ErrorStateMatcher {
    public isErrorState(control: FormControl<unknown> | null): boolean {
        return !!control && control.invalid;
    }
}

function isComponentValid(component: DropdownComponent): ValidatorFn {
    return (): ValidationErrors | null => {
        if (!component.isValid()) {
            return {component: true};
        }

        return null;
    };
}

@Component({
    selector: 'natural-input',
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
    imports: [
        MatFormFieldModule,
        MatRippleModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        NaturalIconDirective,
        MatButtonModule,
    ],
})
export class NaturalInputComponent implements OnInit, OnChanges, OnDestroy {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dropdownService = inject(NaturalDropdownService);
    private readonly injector = inject(EnvironmentInjector);

    /**
     * Controls the ripple effect, used when opening a dropdown
     */
    public readonly ripple = viewChild.required(MatRipple);

    /**
     * Native element ref for <input> related to this <natural-input> component
     */
    public readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

    /**
     * Label for this field
     */
    @Input() public placeholder?: string;

    /**
     * Name of the field on which do a global search (without facet)
     */
    @Input() public searchFieldName = 'search';

    /**
     * Selected setted for this component
     */
    @Input() public selection: NaturalSearchSelection | null = null;

    /**
     * Available facets, allows the user to pick one, than generated then a selection
     */
    @Input({required: true}) public facets!: NaturalSearchFacets;

    /**
     * Text display in the dropdown to select the facet
     */
    @Input() public dropdownTitle = '';

    /**
     * Emits when user a added/updated/deleted a search (from global context or from facet)
     */
    public readonly selectionChange = output<NaturalSearchSelection>();

    /**
     * Emits when user removes the search by pressing the cross icon
     */
    public readonly cleared = output<NaturalInputComponent>();

    /**
     * Selected facet from the list of available facets
     */
    public facet: Facet | null = null;

    /**
     * Controller for the input field
     */
    public readonly formCtrl = new FormControl<string | null>(null);

    /**
     * Customer error matcher that should validate on each change (including initialisation)
     */
    public readonly errorMatcher = new AlwaysErrorStateMatcher();

    /**
     * Reference of the opened dropdown container
     */
    private dropdownRef: NaturalDropdownRef | null = null;

    /**
     * Reference of the component inside the dropdown container
     */
    private dropdownComponentRef: ComponentRef<DropdownComponent> | null = null;

    /**
     *  Minimum input length (number of chars)
     *  See length attribute
     */
    private readonly minLength = 5;

    /**
     * Size of the input (number of chars)
     * Match the input.size attribute
     */
    public length = this.minLength;

    /**
     * Flag, that, if marked as yes, prevents the opening of the dropdown
     * Is used to prevent dropdown opening when natural-search takes the focus from parent context (like on modal opening)
     */
    private neutralizeDropdownOpening = false;

    /**
     * Custom management for taking the focus from parent context
     * When focusing manually on the <input>, a dropdown is opened
     * But when the focus is given from angular in a parent context (like a dialog) the dropdown would open and we don't want it.
     */
    @HostListener('focus')
    public focus(): void {
        this.neutralizeDropdownOpening = true;
        this.input().nativeElement.focus();
        this.neutralizeDropdownOpening = false;
    }

    public ngOnChanges(): void {
        if (!this.facets && this.selection) {
            setTimeout(() => this.clear());
        } else if (this.facets && this.selection) {
            this.facet = getFacetFromSelection(this.facets, this.selection);

            if (this.isDropdown()) {
                const dropdownComponent = this.createComponent(this.facet as DropdownFacet<FacetSelectorConfiguration>);
                this.formCtrl.setValidators([isComponentValid(dropdownComponent)]);
                dropdownComponent.renderedValue.subscribe(value => {
                    this.formCtrl.setValue(value);
                });
            } else if (this.isFlag()) {
                this.formCtrl.setValue('');
            } else if (
                this.selection &&
                this.selection.field === this.searchFieldName &&
                this.selection.condition.like
            ) {
                // global search mode
                this.formCtrl.setValue('' + this.selection.condition.like.value);
            } else {
                // If component is invalid (no facet and not a global search), clear from result and destroy component
                setTimeout(() => this.clear());
            }
        }
    }

    public ngOnInit(): void {
        this.input().nativeElement.addEventListener('focus', () => {
            this.openDropdown();
        });

        this.input().nativeElement.addEventListener('keyup', () => {
            if (!this.dropdownRef) {
                return;
            }

            if (this.formCtrl.value !== '') {
                this.dropdownRef.close();
            }
        });

        if (!this.placeholder) {
            this.placeholder = $localize`Recherche`;
        }

        const placeholderSize = (this.facet ? this.facet.display.length : this.placeholder.length) * 0.66;
        this.length = Math.max(this.minLength, Math.ceil(placeholderSize));
    }

    public ngOnDestroy(): void {
        if (this.dropdownComponentRef) {
            this.dropdownComponentRef.destroy();
        }
    }

    public search(event: Event): void {
        event.stopPropagation();
        event.preventDefault();

        if (!this.formCtrl.value) {
            return;
        }

        if (this.isDropdown()) {
            return;
        }

        if (this.formCtrl.valid && this.formCtrl.dirty) {
            this.selectionChange.emit(this.getSelection({like: {value: this.formCtrl.value}}));
        }
    }

    public clear(): void {
        // Prevent opening the facets list when we are removing a facet
        this.neutralizeDropdownOpening = true;
        setTimeout(() => (this.neutralizeDropdownOpening = false));

        this.facet = null;
        this.selection = null;
        this.formCtrl.setValue(null);
        this.cleared.emit(this);
    }

    public openDropdown(): void {
        if (this.dropdownRef || this.neutralizeDropdownOpening) {
            // Prevent to open multiple dropdowns.
            // Happens as we open on "focus", and alt+tab re-activate focus on an element that already had
            // focus when leaving window with another alt+tab
            return;
        }

        this.launchRipple();

        // If there is no facet and no string typed, show panel to select the facet
        if (!this.facet && !this.formCtrl.value) {
            this.openFacetSelectorDropdown(this.dropdownTitle);
        } else {
            // If a facet is selected, open specific component dropdown
            this.openTypeDropdown();
        }
    }

    public isDropdown(): boolean {
        return !!(this.facet && (this.facet as DropdownFacet<unknown>).component);
    }

    public isFlag(): boolean {
        return !!(this.facet && (this.facet as FlagFacet<FilterGroupConditionField>).condition);
    }

    private createComponent(facet: DropdownFacet<unknown>): DropdownComponent {
        // Always destroy and recreate component
        // Todo : test if facet has changed, if not re-use the component
        if (this.dropdownComponentRef) {
            this.dropdownComponentRef.destroy();
        }

        const condition = this.selection ? this.selection.condition : null;
        const data: NaturalDropdownData = {
            condition: condition,
            configuration: facet.configuration,
        };

        const injector = createEnvironmentInjector(this.createProviders(data), this.injector);
        this.dropdownComponentRef = createComponent(facet.component, {
            environmentInjector: injector,
        });

        return this.dropdownComponentRef.instance;
    }

    private createProviders(data: NaturalDropdownData): StaticProvider[] {
        // Customize injector to allow data and dropdown reference injection in component
        return [
            {
                provide: NaturalDropdownRef,
                useValue: null,
            },
            {
                provide: NATURAL_DROPDOWN_DATA,
                useValue: data,
            },
        ];
    }

    private launchRipple(): void {
        const rippleRef = this.ripple().launch({
            persistent: true,
            centered: true,
        });

        rippleRef.fadeOut();
    }

    private openFacetSelectorDropdown(title: string | undefined): void {
        if (!this.facets || (this.facets && !this.facets.length)) {
            return;
        }

        const data: NaturalDropdownData<FacetSelectorConfiguration> = {
            condition: {},
            title: title,
            configuration: {
                facets: this.facets,
            },
        };

        const injectorTokens = this.createProviders(data);
        this.dropdownRef = this.dropdownService.open(FacetSelectorComponent, this.element, injectorTokens, false);
        this.dropdownRef.closed.subscribe(result => {
            this.dropdownRef = null;
            if (result !== undefined) {
                if (result.facet) {
                    this.setFacet(result.facet);
                } else if (result.condition) {
                    this.setValue(result);
                }
            }
        });
    }

    private openTypeDropdown(): void {
        if (!this.isDropdown()) {
            return;
        }

        const dropdownFacet = this.facet as DropdownFacet<unknown>;

        const data: NaturalDropdownData = {
            condition: this.selection ? this.selection.condition : null,
            configuration: dropdownFacet.configuration,
        };

        const injectorTokens = this.createProviders(data);
        const component = dropdownFacet.component;
        this.dropdownRef = this.dropdownService.open(
            component,
            this.element,
            injectorTokens,
            dropdownFacet.showValidateButton !== undefined ? dropdownFacet.showValidateButton : true,
        );

        this.dropdownRef.closed.subscribe(result => {
            this.dropdownRef = null;
            if (result !== undefined) {
                this.setValue(result);
            }
        });
    }

    private setFacet(facet: Facet): void {
        this.facet = facet;

        if (this.isDropdown()) {
            this.openTypeDropdown();
        } else if (this.isFlag()) {
            this.setValue({
                condition: (facet as FlagFacet<FilterGroupConditionField>).condition,
            });
        } else {
            this.input().nativeElement.focus();
        }
    }

    private setValue(result: DropdownResult): void {
        if (this.facet) {
            this.selectionChange.emit(this.getSelection(result.condition));
        }
    }

    private getSelection(condition: NaturalSearchSelection['condition']): NaturalSearchSelection {
        const selection: NaturalSearchSelection = {
            field: this.facet ? this.facet.field : this.searchFieldName,
            condition: condition,
        };

        if (this.facet?.name) {
            selection.name = this.facet.name;
        }

        return selection;
    }
}
