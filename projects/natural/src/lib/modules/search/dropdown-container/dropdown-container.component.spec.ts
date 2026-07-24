import type {ComponentFixture} from '@angular/core/testing';
import { TestBed} from '@angular/core/testing';
import type {
    NaturalDropdownContainerData} from './dropdown-container.component';
import {
    NATURAL_DROPDOWN_CONTAINER_DATA,
    NaturalDropdownContainerComponent
} from './dropdown-container.component';

describe('NaturalDropdownContainerComponent', () => {
    let component: NaturalDropdownContainerComponent;
    let fixture: ComponentFixture<NaturalDropdownContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                {
                    provide: NATURAL_DROPDOWN_CONTAINER_DATA,
                    useValue: {showValidateButton: false} satisfies NaturalDropdownContainerData,
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalDropdownContainerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
