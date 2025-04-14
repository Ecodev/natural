import {EnvironmentProviders, inject, provideAppInitializer, Provider} from '@angular/core';
import {NATURAL_SEO_CONFIG, NaturalSeoConfig, NaturalSeoService} from './seo.service';

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
