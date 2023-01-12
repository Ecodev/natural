import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalInputComponent} from '../input/input.component';

import {NaturalGroupComponent} from './group.component';
import {testImports} from '../../../../../../../src/app/shared/testing/module';

describe('GroupComponent', () => {
    let component: NaturalGroupComponent;
    let fixture: ComponentFixture<NaturalGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NaturalGroupComponent, NaturalInputComponent],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
