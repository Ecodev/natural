import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NATURAL_DROPDOWN_CONTAINER_DATA, NaturalDropdownContainerComponent} from './dropdown-container.component';
import {testImports} from '../../../../../../../src/app/shared/testing/module';

describe('NaturalDropdownContainerComponent', () => {
    let component: NaturalDropdownContainerComponent;
    let fixture: ComponentFixture<NaturalDropdownContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NaturalDropdownContainerComponent],
            imports: [...testImports],
            providers: [
                {
                    provide: NATURAL_DROPDOWN_CONTAINER_DATA,
                    useValue: {},
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
