import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalIconComponent} from './icon.component';
import {testImports} from '../../../../../../src/app/shared/testing/module';

describe('NaturalIconComponent', () => {
    let component: NaturalIconComponent;
    let fixture: ComponentFixture<NaturalIconComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalIconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
