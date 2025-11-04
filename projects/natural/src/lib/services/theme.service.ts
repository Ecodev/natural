import {
    DOCUMENT,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    provideAppInitializer,
    Provider,
    signal,
} from '@angular/core';
import {LOCAL_STORAGE} from '../modules/common/services/memory-storage';

export const NATURAL_THEMES_CONFIG = new InjectionToken<string[]>('Configuration for Natural Theme');

export function provideThemes(config: string[]): (EnvironmentProviders | Provider)[] {
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
    private readonly document = inject(DOCUMENT);
    private readonly allThemes = inject(NATURAL_THEMES_CONFIG);
    private readonly storage = inject(LOCAL_STORAGE);

    public readonly isDark = signal<boolean>(false);
    public readonly theme = signal<string>(this.allThemes[0]);
    public readonly colorScheme = signal<ColorScheme>(ColorScheme.Light);

    public constructor() {
        if (this.allThemes.length === 0) {
            throw Error('No theme provided');
        }

        const theme = this.storage.getItem('theme');
        const isValidTheme = theme && this.allThemes.includes(theme);
        this.setTheme(isValidTheme ? theme : this.allThemes[0]);

        const storedScheme = this.storage.getItem('color-scheme') as ColorScheme | null;
        const isValidScheme = storedScheme && Object.values(ColorScheme).includes(storedScheme);
        this.setColorScheme(isValidScheme ? storedScheme : ColorScheme.Auto);
    }

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
    public setColorScheme(scheme: ColorScheme): void {
        this.colorScheme.set(scheme); // memory
        this.storage.setItem('color-scheme', this.colorScheme()); // storage
        this.document.documentElement.setAttribute('data-color-scheme', scheme); // dom

        // If manual dark, or auto dark
        const dark =
            scheme === ColorScheme.Dark ||
            (scheme === ColorScheme.Auto &&
                !!this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches);
        this.isDark.set(dark); // memory
        this.document.documentElement.setAttribute('data-is-dark', dark ? 'true' : 'false'); // dom;
    }
}
