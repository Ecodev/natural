import type {EnvironmentProviders, Provider} from '@angular/core';
import { inject, provideAppInitializer} from '@angular/core';
import type { NaturalSeoConfig} from './seo.service';
import {NATURAL_SEO_CONFIG, NaturalSeoService} from './seo.service';

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
