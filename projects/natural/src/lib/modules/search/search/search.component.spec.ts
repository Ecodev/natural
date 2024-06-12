import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalSearchComponent} from './search.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('NaturalSearchComponent', () => {
    let component: NaturalSearchComponent;
    let fixture: ComponentFixture<NaturalSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations()],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
