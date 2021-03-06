import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {
    NaturalAlertModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalRelationsModule,
    NaturalSearchModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';

import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {MaterialModule} from '../material.module';

import {SearchComponent} from './search.component';

describe('Demo SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [SearchComponent],
                imports: [
                    RouterTestingModule,
                    BrowserAnimationsModule,
                    MaterialModule,
                    NaturalAlertModule,
                    NaturalStampModule,
                    NaturalSelectModule,
                    NaturalSidenavModule,
                    NaturalRelationsModule,
                    NaturalFixedButtonModule,
                    NaturalTableButtonModule,
                    NaturalDetailHeaderModule,
                    NaturalColumnsPickerModule,
                    NaturalFixedButtonDetailModule,
                    NaturalHierarchicSelectorModule,
                    NaturalDropdownComponentsModule,
                    NaturalCommonModule,
                    NaturalSearchModule,
                    NaturalIconModule.forRoot({}),
                ],
                providers: [MockApolloProvider],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
