import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalGroupComponent} from './group.component';

describe('GroupComponent', () => {
    let component: NaturalGroupComponent;
    let fixture: ComponentFixture<NaturalGroupComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalGroupComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
