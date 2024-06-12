import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    NATURAL_DROPDOWN_CONTAINER_DATA,
    NaturalDropdownContainerComponent,
    NaturalDropdownContainerData,
} from './dropdown-container.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('NaturalDropdownContainerComponent', () => {
    let component: NaturalDropdownContainerComponent;
    let fixture: ComponentFixture<NaturalDropdownContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                provideNoopAnimations(),
                {
                    provide: NATURAL_DROPDOWN_CONTAINER_DATA,
                    useValue: {showValidateButton: false} satisfies NaturalDropdownContainerData,
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalDropdownContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
