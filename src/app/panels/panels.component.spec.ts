import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PanelsComponent} from './panels.component';
import {provideRouter} from '@angular/router';

describe('Demo PanelsComponent', () => {
    let component: PanelsComponent;
    let fixture: ComponentFixture<PanelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([])],
        }).compileComponents();
        fixture = TestBed.createComponent(PanelsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
