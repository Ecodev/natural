import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalPanelsComponent} from './panels.component';
import {providePanels} from './panels.module';
import {naturalProviders} from '@ecodev/natural';
import {provideRouter} from '@angular/router';

describe('PanelComponent', () => {
    let component: NaturalPanelsComponent;
    let fixture: ComponentFixture<NaturalPanelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([]), providePanels({}), naturalProviders],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalPanelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
