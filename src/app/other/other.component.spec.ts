import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OtherComponent} from './other.component';
import {provideRouter} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient} from '@angular/common/http';

describe('OtherComponent', () => {
    let component: OtherComponent;
    let fixture: ComponentFixture<OtherComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), provideRouter([]), provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(OtherComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
