import {ErrorHandler, ModuleWithProviders, NgModule, Provider} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NaturalGroupComponent} from './modules/search/group/group.component';
import {NaturalInputComponent} from './modules/search/input/input.component';
import {NaturalDropdownContainerComponent} from './modules/search/dropdown-container/dropdown-container.component';
import {FacetSelectorComponent} from './modules/search/facet-selector/facet-selector.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatRippleModule} from '@angular/material/core';
import {PortalModule} from '@angular/cdk/portal';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import {HttpClientModule} from '@angular/common/http';
import {NaturalErrorHandlerConfig} from './modules/logger/types';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTreeModule} from '@angular/material/tree';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {AvatarComponent} from './modules/avatar/component/avatar.component';
import {NaturalCapitalizePipe} from './modules/common/pipes/capitalize.pipe';
import {NaturalStampComponent} from './modules/stamp/stamp.component';
import {NaturalRelationsComponent} from './modules/relations/relations.component';
import {localStorageProvider, sessionStorageProvider} from './modules/common/services/memory-storage';
import {NaturalColumnsPickerComponent} from './modules/columns-picker/columns-picker.component';
import {NaturalTableButtonComponent} from './modules/table-button/table-button.component';
import {IconsConfigService, NaturalIconComponent, NaturalIconsConfig} from './modules/icon/icon.component';
import {NaturalSidenavComponent} from './modules/sidenav/sidenav/sidenav.component';
import {NaturalEnumPipe} from './modules/common/pipes/enum.pipe';
import {NaturalEllipsisPipe} from './modules/common/pipes/ellipsis.pipe';
import {NaturalFileSelectDirective} from './modules/file/file-select.directive';
import {NaturalSidenavContentComponent} from './modules/sidenav/sidenav-content/sidenav-content.component';
import {NaturalSelectHierarchicComponent} from './modules/select/select-hierarchic/select-hierarchic.component';
import {NaturalFixedButtonDetailComponent} from './modules/fixed-button-detail/fixed-button-detail.component';
import {NaturalSidenavContainerComponent} from './modules/sidenav/sidenav-container/sidenav-container.component';
import {NaturalColumnsPickerColumnDirective} from './modules/columns-picker/columns-picker-column.directive';
import {NaturalDetailHeaderComponent} from './modules/detail-header/detail-header.component';
import {NaturalLinkableTabDirective} from './modules/common/directives/linkable-tab.directive';
import {NaturalHierarchicSelectorDialogComponent} from './modules/hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.component';
import {FileComponent} from './modules/file/component/file.component';
import {NaturalSelectComponent} from './modules/select/select/select.component';
import {NaturalSwissDatePipe} from './modules/common/pipes/swiss-date.pipe';
import {NaturalDialogTriggerComponent} from './modules/dialog-trigger/dialog-trigger.component';
import {NaturalConfirmComponent} from './modules/alert/confirm.component';
import {NaturalHierarchicSelectorComponent} from './modules/hierarchic-selector/hierarchic-selector/hierarchic-selector.component';
import {NaturalSelectEnumComponent} from './modules/select/select-enum/select-enum.component';
import {NaturalFileDropDirective} from './modules/file/file-drop.directive';
import {NaturalPanelsHooksConfig, PanelsHooksConfig} from './modules/panels/types';
import {NaturalFixedButtonComponent} from './modules/fixed-button/fixed-button.component';
import {NaturalPanelsComponent} from './modules/panels/panels.component';
import {NaturalHttpPrefixDirective} from './directives/http-prefix.directive';
import {NaturalHierarchicSelectorDialogService} from './modules/hierarchic-selector/hierarchic-selector-dialog/hierarchic-selector-dialog.service';
import {NaturalSrcDensityDirective} from './modules/common/directives/src-density.directive';
import {NaturalTimeAgoPipe} from './modules/common/pipes/time-ago.pipe';
import {TypeDateComponent} from './modules/dropdown-components/type-date/type-date.component';
import {TypeDateRangeComponent} from './modules/dropdown-components/type-date-range/type-date-range.component';
import {TypeHierarchicSelectorComponent} from './modules/dropdown-components/type-hierarchic-selector/type-hierarchic-selector.component';
import {TypeNumberComponent} from './modules/dropdown-components/type-number/type-number.component';
import {TypeSelectComponent} from './modules/dropdown-components/type-select/type-select.component';
import {TypeNaturalSelectComponent} from './modules/dropdown-components/type-natural-select/type-natural-select.component';
import {TypeTextComponent} from './modules/dropdown-components/type-text/type-text.component';
import {NaturalSearchComponent} from './modules/search/search/search.component';
import {NaturalErrorHandler, NaturalLoggerConfigExtra, NaturalLoggerConfigUrl} from './modules/logger/error-handler';

const declarationsToExport = [
    AvatarComponent,
    FileComponent,
    NaturalCapitalizePipe,
    NaturalColumnsPickerColumnDirective,
    NaturalColumnsPickerComponent,
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
    NaturalSrcDensityDirective,
    NaturalStampComponent,
    NaturalSwissDatePipe,
    NaturalTableButtonComponent,
    NaturalTimeAgoPipe,
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
        HttpClientModule,
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
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {appearance: 'fill'},
        },
        NaturalHierarchicSelectorDialogService,
        sessionStorageProvider,
        localStorageProvider,
        // Default value so panel can work without config
        {
            provide: PanelsHooksConfig,
            useValue: {},
        },
        // Default value so icons can work without config
        {
            provide: IconsConfigService,
            useValue: {},
        },
    ],
})
export class NaturalModule {
    public static forRoot(config: Config): ModuleWithProviders<NaturalModule> {
        const providers: Provider[] = [];

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

        if (config.errorHandler) {
            providers.push(
                {
                    provide: ErrorHandler,
                    useClass: NaturalErrorHandler,
                },
                {
                    provide: NaturalLoggerConfigUrl,
                    useValue: config.errorHandler.url,
                },
            );

            if (config.errorHandler.extraService) {
                providers.push({
                    provide: NaturalLoggerConfigExtra,
                    useClass: config.errorHandler.extraService,
                });
            }
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
    errorHandler?: NaturalErrorHandlerConfig;
};
