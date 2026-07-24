import {type EnvironmentProviders, inject, provideAppInitializer, type Provider} from '@angular/core';
import {NATURAL_SEO_CONFIG, type NaturalSeoConfig, NaturalSeoService} from './seo.service';

/**
 * Configure and starts `NaturalSeoService`
 */
export function provideSeo(config: NaturalSeoConfig): (EnvironmentProviders | Provider)[] {
    return [
        {
            provide: NATURAL_SEO_CONFIG,
            useValue: config,
        },
        provideAppInitializer(() => {
            // injection required, but works without doing anything else
            inject(NaturalSeoService);
        }),
    ];
}
