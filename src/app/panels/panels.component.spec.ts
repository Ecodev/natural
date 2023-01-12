import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PanelsComponent} from './panels.component';
import {testImports} from '../shared/testing/module';

describe('Demo PanelsComponent', () => {
    let component: PanelsComponent;
    let fixture: ComponentFixture<PanelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PanelsComponent],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(PanelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
