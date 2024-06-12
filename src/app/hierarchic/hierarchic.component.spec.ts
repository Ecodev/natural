import {ComponentFixture, TestBed} from '@angular/core/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {HierarchicComponent} from './hierarchic.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('HierarchicComponent', () => {
    let component: HierarchicComponent;
    let fixture: ComponentFixture<HierarchicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(HierarchicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
