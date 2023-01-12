import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalFixedButtonComponent} from './fixed-button.component';
import {testImports} from '../../../../../../src/app/shared/testing/module';

describe('FixedButtonComponent', () => {
    let component: NaturalFixedButtonComponent;
    let fixture: ComponentFixture<NaturalFixedButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalFixedButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
