import {ComponentFixture, TestBed} from '@angular/core/testing';
import {naturalProviders} from '@ecodev/natural';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {SelectEnumComponent} from './select-enum.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('Demo SelectEnumComponent', () => {
    let component: SelectEnumComponent;
    let fixture: ComponentFixture<SelectEnumComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [provideNoopAnimations(), naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(SelectEnumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
