import {CommonModule} from '@angular/common';
import {TestBed, tick, waitForAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FilterGroupConditionField, TypeNaturalSelectComponent, TypeSelectNaturalConfiguration} from '@ecodev/natural';
import {NATURAL_DROPDOWN_DATA} from '../../search/dropdown-container/dropdown.service';
import {AnyService} from '../../../testing/any.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {testAssociationSelect, TestFixture} from '../testing/utils';

function createComponent(
    fixture: TestFixture<TypeNaturalSelectComponent<AnyService>, TypeSelectNaturalConfiguration<AnyService>>,
    condition: FilterGroupConditionField | null,
): void {
    const configuration: TypeSelectNaturalConfiguration<AnyService> = {
        service: null as any, // This will be completed as soon as we finished configuring our TestBed
        placeholder: 'My placeholder',
    };
    fixture.data.condition = condition;
    fixture.data.configuration = configuration;

    TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: fixture.data});

    configuration.service = TestBed.inject(AnyService);

    fixture.component =
        TestBed.createComponent<TypeNaturalSelectComponent<AnyService>>(TypeNaturalSelectComponent).componentInstance;

    tick(5000);
}

describe('TypeNaturalSelectComponent', () => {
    const fixture: TestFixture<TypeNaturalSelectComponent<AnyService>, TypeSelectNaturalConfiguration<AnyService>> = {
        component: null as any,
        data: {
            condition: null,
            configuration: null as any,
        },
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [TypeNaturalSelectComponent],
                imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule],
                providers: [
                    {
                        provide: NATURAL_DROPDOWN_DATA,
                        useValue: fixture.data,
                    },
                ],
            }).compileComponents();
        }),
    );

    testAssociationSelect(fixture, createComponent);
});
