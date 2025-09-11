import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    NATURAL_DROPDOWN_CONTAINER_DATA,
    NaturalDropdownContainerComponent,
    NaturalDropdownContainerData,
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
