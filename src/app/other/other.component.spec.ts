import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {OtherComponent} from './other.component';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withXhr} from '@angular/common/http';

describe('OtherComponent', () => {
    let component: OtherComponent;
    let fixture: ComponentFixture<OtherComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([]), provideHttpClient(withXhr())],
        }).compileComponents();
        fixture = TestBed.createComponent(OtherComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
