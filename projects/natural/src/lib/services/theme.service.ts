import {isPlatformBrowser} from '@angular/common';
import {
    DOCUMENT,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    PLATFORM_ID,
    provideAppInitializer,
    Provider,
    signal,
} from '@angular/core';
import {LOCAL_STORAGE} from '../modules/common/services/memory-storage';

type AllThemes = [string, ...string[]];
export const NATURAL_THEMES_CONFIG = new InjectionToken<AllThemes>('Configuration for Natural Theme');

export function provideThemes(config: AllThemes): (EnvironmentProviders | Provider)[] {
    return [
        {
            provide: NATURAL_THEMES_CONFIG,
            useValue: config,
        },
        provideAppInitializer(() => {
            inject(NaturalThemeService);
        }),
    ];
}

export enum ColorScheme {
    Light = 'light',
    Dark = 'dark',
    Auto = 'auto',
}

@Injectable({
    providedIn: 'root',
})
export class NaturalThemeService {
    private readonly allThemes = inject(NATURAL_THEMES_CONFIG);
    private readonly storage = inject(LOCAL_STORAGE);
    private readonly platformId = inject(PLATFORM_ID);
    protected readonly document = inject(DOCUMENT);

    public readonly isDark = signal<boolean>(false);
    public readonly theme = signal<string>(this.allThemes[0]);
    public readonly colorScheme = signal<ColorScheme>(ColorScheme.Light);

    /**
     * Set theme in memory, local storage and dom
     */
    public setTheme(name: string): void {
        this.theme.set(name);
        this.storage.setItem('theme', name);
        this.document.documentElement.setAttribute('data-theme', name);
    }

    /**
     * Set color scheme in memory, local storage and dom and keep in sync isDark property
     */
    public setColorScheme(scheme: ColorScheme, persistInStorage = true): void {
        this.colorScheme.set(scheme); // memory
        this.document.documentElement.setAttribute('data-color-scheme', scheme); // dom

        // If manual dark, or auto + dark system
        const dark =
            scheme === ColorScheme.Dark ||
            (scheme === ColorScheme.Auto &&
                isPlatformBrowser(this.platformId) &&
                !!this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches);

        this.isDark.set(dark); // memory
        this.document.documentElement.setAttribute('data-is-dark', dark ? 'true' : 'false'); // dom;

        if (persistInStorage) {
            this.storage.setItem('color-scheme', this.colorScheme()); // storage
        }
    }
}
