import {ComponentFixture, TestBed} from '@angular/core/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {RelationsComponent} from './relations.component';
import {provideRouter} from '@angular/router';

describe('RelationsComponent', () => {
    let component: RelationsComponent;
    let fixture: ComponentFixture<RelationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideRouter([]), naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(RelationsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
