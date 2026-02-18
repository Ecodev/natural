import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ButtonsSetComponent} from './buttons-set.component';

describe('ButtonsComponent', () => {
    let component: ButtonsSetComponent;
    let fixture: ComponentFixture<ButtonsSetComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonsSetComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonsSetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
