import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalPanelsComponent} from './panels.component';
import {testImports} from '../../../../../../src/app/shared/testing/module';

describe('PanelComponent', () => {
    let component: NaturalPanelsComponent;
    let fixture: ComponentFixture<NaturalPanelsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalPanelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
