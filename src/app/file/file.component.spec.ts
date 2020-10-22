import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {
    NaturalModule,
    NaturalColumnsPickerModule,
    NaturalCommonModule,
    NaturalDetailHeaderModule,
    NaturalDropdownComponentsModule,
    NaturalFixedButtonDetailModule,
    NaturalFixedButtonModule,
    NaturalHierarchicSelectorModule,
    NaturalIconModule,
    NaturalRelationsModule,
    NaturalFileModule,
    NaturalSelectModule,
    NaturalSidenavModule,
    NaturalStampModule,
    NaturalTableButtonModule,
} from '@ecodev/natural';
import {ApolloModule} from 'apollo-angular';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {MaterialModule} from '../material.module';

import {FileComponent} from './file.component';

describe('Demo FileComponent', () => {
    let component: FileComponent;
    let fixture: ComponentFixture<FileComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [FileComponent],
                imports: [
                    RouterTestingModule,
                    BrowserAnimationsModule,
                    MaterialModule,
                    NaturalModule,
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
                    NaturalFileModule,
                    ApolloModule,
                    NaturalIconModule.forRoot({}),
                ],
                providers: [MockApolloProvider],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(FileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
