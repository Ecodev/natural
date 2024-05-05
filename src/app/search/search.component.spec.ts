import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {SearchComponent} from './search.component';

describe('Demo SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RouterTestingModule],
            providers: [naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
