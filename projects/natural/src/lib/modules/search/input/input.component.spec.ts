import {OverlayModule} from '@angular/cdk/overlay';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalInputComponent} from './input.component';
import {NaturalModule} from '@ecodev/natural';
import {testImports} from '../../../../../../../src/app/shared/testing/module';

describe('NaturalInputComponent', () => {
    let component: NaturalInputComponent;
    let fixture: ComponentFixture<NaturalInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NaturalInputComponent],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
