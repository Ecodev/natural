import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalInputComponent} from './input.component';

describe('NaturalInputComponent', () => {
    let component: NaturalInputComponent;
    let fixture: ComponentFixture<NaturalInputComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalInputComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
