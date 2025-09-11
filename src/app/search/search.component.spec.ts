import {ComponentFixture, TestBed} from '@angular/core/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {SearchComponent} from './search.component';
import {provideRouter} from '@angular/router';

describe('Demo SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([]), naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
