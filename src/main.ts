import {provideHttpClient} from '@angular/common/http';
import {enableProdMode, provideZoneChangeDetection} from '@angular/core';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {MAT_PAGINATOR_DEFAULT_OPTIONS, MatPaginatorDefaultOptions} from '@angular/material/paginator';
import {MAT_TABS_CONFIG, MatTabsConfig} from '@angular/material/tabs';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter, withRouterConfig} from '@angular/router';
import {
    NaturalLinkMutationService,
    naturalProviders,
    NaturalSwissParsingDateAdapter,
    provideErrorHandler,
    provideIcons,
    providePanels,
    provideSeo,
    provideThemes,
} from '@ecodev/natural';
import {routes} from './app/app-routing';
import {AppComponent} from './app/app.component';
import {DemoLoggerExtra} from './app/demo.error-handler';
import {AnyLinkMutationService} from './app/shared/services/any-link-mutation.service';
import {environment} from './environments/environment';
import {provideApollo} from 'apollo-angular';
import {InMemoryCache} from '@apollo/client/core';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideNativeDateAdapter(),
        provideApollo(() => ({cache: new InMemoryCache()})),
        naturalProviders,
        provideIcons({
            natural: {
                svg: 'assets/logo.svg',
            },
            github: {
                svg: 'assets/github.svg',
            },
        }),
        provideErrorHandler(null, DemoLoggerExtra),
        providePanels({}),
        {
            provide: DateAdapter,
            useClass: NaturalSwissParsingDateAdapter,
        },
        {
            provide: NaturalLinkMutationService,
            useClass: AnyLinkMutationService,
        },
        {
            // See https://github.com/angular/components/issues/26580
            provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
            useValue: {
                formFieldAppearance: 'fill',
            } satisfies MatPaginatorDefaultOptions,
        },
        {
            provide: MAT_TABS_CONFIG,
            useValue: {
                stretchTabs: false,
            } satisfies MatTabsConfig,
        },
        provideHttpClient(),
        provideRouter(
            routes,
            withRouterConfig({
                paramsInheritanceStrategy: 'always',
                resolveNavigationPromiseOnError: true, // So that panels can open and navigate across themselves
            }),
        ),
        provideSeo({
            applicationName: 'Natural',
            defaultDescription: 'An amazing angular library',
            languages: ['fr', 'en', 'de', 'it', 'pt'],
        }),
        provideThemes([
            'natural',
            'epicerio',
            'chez-emmy',
            'epicentre',
            'epicoop',
            'jardinvivant',
            'lacanopee',
            'lavracrie',
            'lelocalhauterive',
            'levorace',
            'rucher',
        ]),
    ],
}).catch((err: unknown) => {
    console.error(err);
});
