import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalFixedButtonComponent} from './fixed-button.component';
import {provideRouter} from '@angular/router';

describe('FixedButtonComponent', () => {
    let component: NaturalFixedButtonComponent;
    let fixture: ComponentFixture<NaturalFixedButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([])],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalFixedButtonComponent);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
