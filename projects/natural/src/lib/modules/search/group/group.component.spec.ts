import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalGroupComponent} from './group.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('GroupComponent', () => {
    let component: NaturalGroupComponent;
    let fixture: ComponentFixture<NaturalGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations()],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
