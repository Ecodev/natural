import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalSearchComponent} from './search.component';

describe('NaturalSearchComponent', () => {
    let component: NaturalSearchComponent;
    let fixture: ComponentFixture<NaturalSearchComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(NaturalSearchComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
