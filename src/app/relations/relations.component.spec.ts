import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {RelationsComponent} from './relations.component';

describe('RelationsComponent', () => {
    let component: RelationsComponent;
    let fixture: ComponentFixture<RelationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, RouterTestingModule],
            providers: [naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(RelationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
