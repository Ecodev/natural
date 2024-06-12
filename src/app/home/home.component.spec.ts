import {ComponentFixture, TestBed} from '@angular/core/testing';
import {naturalProviders} from '@ecodev/natural';
import {HomeComponent} from './home.component';
import {provideRouter} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('Demo HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), provideRouter([]), naturalProviders],
        }).compileComponents();
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
