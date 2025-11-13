import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../../search/types/dropdown-component';
import {TypeOptionsComponent, TypeOptionsConfiguration} from '../type-options/type-options.component';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';

export type TypeBooleanConfiguration = {
    displayWhenActive: string;
    displayWhenInactive: string;
};

@Component({
    imports: [FormsModule, ReactiveFormsModule, MatButtonToggleGroup, MatButtonToggle],
    templateUrl: '../type-options/type-options.component.html',
    providers: [
        {
            provide: NATURAL_DROPDOWN_DATA,
            useFactory: (): NaturalDropdownData<TypeOptionsConfiguration> => {
                const data = inject<NaturalDropdownData<TypeBooleanConfiguration>>(NATURAL_DROPDOWN_DATA, {
                    skipSelf: true,
                });

                // Set up options from hardcoded conditions with custom labels from config
                return {
                    ...data,
                    configuration: {
                        options: [
                            {
                                display: data.configuration.displayWhenActive,
                                condition: {equal: {value: true}},
                            },
                            {
                                display: data.configuration.displayWhenInactive,
                                condition: {equal: {value: false}},
                            },
                        ],
                    },
                };
            },
        },
    ],
})
export class TypeBooleanComponent extends TypeOptionsComponent implements DropdownComponent {}
