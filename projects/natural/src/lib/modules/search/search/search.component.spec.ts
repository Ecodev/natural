import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatRippleModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NaturalDropdownContainerComponent} from '../dropdown-container/dropdown-container.component';
import {FacetSelectorComponent} from '../facet-selector/facet-selector.component';
import {NaturalGroupComponent} from '../group/group.component';
import {NaturalInputComponent} from '../input/input.component';
import {NaturalSearchComponent} from './search.component';
import {NaturalModule} from '@ecodev/natural';
import {testImports} from '../../../../../../../src/app/shared/testing/module';

describe('NaturalSearchComponent', () => {
    let component: NaturalSearchComponent;
    let fixture: ComponentFixture<NaturalSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                NaturalSearchComponent,
                NaturalGroupComponent,
                NaturalInputComponent,
                NaturalDropdownContainerComponent,
                FacetSelectorComponent,
            ],
            imports: [...testImports],
        }).compileComponents();
        fixture = TestBed.createComponent(NaturalSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
