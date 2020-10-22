import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NaturalConfirmComponent} from './modules/alert/confirm.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NaturalColumnsPickerColumnDirective} from './modules/columns-picker/columns-picker-column.directive';
import {NaturalColumnsPickerComponent} from './modules/columns-picker/columns-picker.component';
import {NaturalCapitalizePipe} from './modules/common/pipes/capitalize.pipe';
import {NaturalDefaultPipe} from './modules/common/pipes/default.pipe';
import {NaturalEllipsisPipe} from './modules/common/pipes/ellipsis.pipe';
import {NaturalEnumPipe} from './modules/common/pipes/enum.pipe';
import {NaturalSwissDatePipe} from './modules/common/pipes/swiss-date.pipe';
import {ReactiveAsteriskDirective} from './modules/common/directives/reactive-asterisk.directive';
import {NaturalHttpPrefixDirective} from './directives/http-prefix.directive';
import {NaturalLinkableTabDirective} from './modules/common/directives/linkable-tab.directive';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {sessionStorageProvider} from './modules/common/services/memory-storage';
import {NaturalDetailHeaderComponent} from './modules/detail-header/detail-header.component';
import {RouterModule} from '@angular/router';
import {NaturalDialogTriggerComponent} from './modules/dialog-trigger/dialog-trigger.component';
import {NaturalFileDropDirective} from './modules/file/file-drop.directive';
import {NaturalFileSelectDirective} from './modules/file/file-select.directive';
import {FileComponent} from './modules/file/component/file.component';
import {MatRippleModule} from '@angular/material/core';
import {NaturalFixedButtonDetailComponent} from './modules/fixed-button-detail/fixed-button-detail.component';
import {NaturalFixedButtonComponent} from './modules/fixed-button/fixed-button.component';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {NaturalHierarchicSelectorComponent} from './modules/hierarchic-selector/hierarchic-selector/hierarchic-selector.component';
import {NaturalHierarchicSelectorDialogComponent} from './modules/hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import {NaturalHierarchicSelectorDialogService} from './modules/hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.service';
import {IconsConfigService, NaturalIconComponent, NaturalIconsConfig} from './modules/icon/icon.component';
import {MatListModule} from '@angular/material/list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {TypeNumberComponent} from './modules/dropdown-components/type-number/type-number.component';
import {TypeSelectComponent} from './modules/dropdown-components/type-select/type-select.component';
import {TypeDateComponent} from './modules/dropdown-components/type-date/type-date.component';
import {TypeDateRangeComponent} from './modules/dropdown-components/type-date-range/type-date-range.component';
import {TypeNaturalSelectComponent} from './modules/dropdown-components/type-natural-select/type-natural-select.component';
import {TypeTextComponent} from './modules/dropdown-components/type-text/type-text.component';
import {TypeHierarchicSelectorComponent} from './modules/dropdown-components/type-hierarchic-selector/type-hierarchic-selector.component';
import {NaturalPanelsHooksConfig, PanelsHooksConfig} from './modules/panels/types';
import {NaturalPanelsComponent} from './modules/panels/panels.component';
import {NaturalTableButtonComponent} from './modules/table-button/table-button.component';
import {NaturalStampComponent} from './modules/stamp/stamp.component';
import {NaturalSidenavComponent} from './modules/sidenav/sidenav/sidenav.component';
import {NaturalSidenavContainerComponent} from './modules/sidenav/sidenav-container/sidenav-container.component';
import {NaturalSidenavContentComponent} from './modules/sidenav/sidenav-content/sidenav-content.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NaturalSelectComponent} from './modules/select/select/select.component';
import {NaturalSelectEnumComponent} from './modules/select/select-enum/select-enum.component';
import {NaturalSelectHierarchicComponent} from './modules/select/select-hierarchic/select-hierarchic.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {NaturalSearchComponent} from './modules/search/search/search.component';
import {NaturalGroupComponent} from './modules/search/group/group.component';
import {NaturalInputComponent} from './modules/search/input/input.component';
import {NaturalDropdownContainerComponent} from './modules/search/dropdown-container/dropdown-container.component';
import {FacetSelectorComponent} from './modules/search/facet-selector/facet-selector.component';
import {PortalModule} from '@angular/cdk/portal';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {NaturalRelationsComponent} from './modules/relations/relations.component';

const declarationsToExport = [
    FileComponent,
    NaturalCapitalizePipe,
    NaturalColumnsPickerColumnDirective,
    NaturalColumnsPickerComponent,
    NaturalDefaultPipe,
    NaturalDetailHeaderComponent,
    NaturalDialogTriggerComponent,
    NaturalEllipsisPipe,
    NaturalEnumPipe,
    NaturalFileDropDirective,
    NaturalFileSelectDirective,
    NaturalFixedButtonComponent,
    NaturalFixedButtonDetailComponent,
    NaturalHierarchicSelectorComponent,
    NaturalHttpPrefixDirective,
    NaturalIconComponent,
    NaturalLinkableTabDirective,
    NaturalPanelsComponent,
    NaturalRelationsComponent,
    NaturalSearchComponent,
    NaturalSelectComponent,
    NaturalSelectEnumComponent,
    NaturalSelectHierarchicComponent,
    NaturalSidenavComponent,
    NaturalSidenavContainerComponent,
    NaturalSidenavContentComponent,
    NaturalStampComponent,
    NaturalSwissDatePipe,
    NaturalTableButtonComponent,
    ReactiveAsteriskDirective,
    TypeDateComponent,
    TypeDateRangeComponent,
    TypeHierarchicSelectorComponent,
    TypeNaturalSelectComponent,
    TypeNumberComponent,
    TypeSelectComponent,
    TypeTextComponent,
];

@NgModule({
    declarations: [
        ...declarationsToExport,
        FacetSelectorComponent,
        NaturalConfirmComponent,
        NaturalDropdownContainerComponent,
        NaturalGroupComponent,
        NaturalHierarchicSelectorDialogComponent,
        NaturalInputComponent,
    ],
    imports: [
        CdkTreeModule,
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSnackBarModule,
        MatTableModule,
        MatTooltipModule,
        MatTreeModule,
        OverlayModule,
        PortalModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    exports: [...declarationsToExport],
    providers: [
        sessionStorageProvider,
        NaturalHierarchicSelectorDialogService,
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {appearance: 'fill'},
        },
    ],
})
export class NaturalModule {
    public static forRoot(config: Config): ModuleWithProviders<NaturalModule> {
        const providers = [];
        if (config.icons) {
            providers.push({
                provide: IconsConfigService,
                useValue: config.icons,
            });
        }

        if (config.panels) {
            providers.push({
                provide: PanelsHooksConfig,
                useValue: config.panels,
            });
        }

        return {
            ngModule: NaturalModule,
            providers: providers,
        };
    }
}

export type Config = {
    icons?: NaturalIconsConfig;
    panels?: NaturalPanelsHooksConfig;
};
