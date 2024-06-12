import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalInputComponent} from './input.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('NaturalInputComponent', () => {
    let component: NaturalInputComponent;
    let fixture: ComponentFixture<NaturalInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations()],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
