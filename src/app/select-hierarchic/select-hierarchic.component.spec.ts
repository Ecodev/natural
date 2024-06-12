import {ComponentFixture, TestBed} from '@angular/core/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {SelectHierarchicComponent} from './select-hierarchic.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';

describe('Demo SelectHierarchicComponent', () => {
    let component: SelectHierarchicComponent;
    let fixture: ComponentFixture<SelectHierarchicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), provideRouter([]), naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(SelectHierarchicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
