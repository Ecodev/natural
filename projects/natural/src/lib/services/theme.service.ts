import {isPlatformBrowser} from '@angular/common';
import {
    computed,
    DOCUMENT,
    effect,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    makeEnvironmentProviders,
    PLATFORM_ID,
    provideAppInitializer,
    signal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {fromEvent, map, of} from 'rxjs';
import {startWith} from 'rxjs/operators';
import {LOCAL_STORAGE} from '../modules/common/services/memory-storage';

type AllThemes = [string, ...string[]];
export const NATURAL_THEMES_CONFIG = new InjectionToken<AllThemes>('Configuration for Natural Theme');

/**
 * If you are using themes, or color scheme, then you must provide themes at the application level.
 *
 * If there is a only one theme, you still need to provide a name for it (eg: "my-app"), even if
 * it is not used in the SCSS.
 */
export function provideThemes(config: AllThemes): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: NATURAL_THEMES_CONFIG,
            useValue: config,
        },
        provideAppInitializer(() => {
            inject(NaturalThemeService);
        }),
    ]);
}

export enum ColorScheme {
    Light = 'light',
    Dark = 'dark',
    Auto = 'auto',
}

export const colorSchemeOptions = [
    {value: ColorScheme.Auto, label: $localize`Thème de l'appareil`, icon: 'routine'},
    {value: ColorScheme.Light, label: $localize`Thème clair`, icon: 'light_mode'},
    {value: ColorScheme.Dark, label: $localize`Thème sombre`, icon: 'dark_mode'},
] as const;

/**
 * The source of truth is the DOM. And thus the index.html (or equivalent) must use vanilla JavaScript
 * to restore `data-color-scheme` and `data-theme` attributes on the `<html>` element (eg: from
 * local storage, or from DB).
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalThemeService {
    private readonly allThemes = inject(NATURAL_THEMES_CONFIG);
    private readonly storage = inject(LOCAL_STORAGE);
    private readonly platformId = inject(PLATFORM_ID);
    protected readonly document = inject(DOCUMENT);
    private readonly htmlElement = this.document.documentElement;

    private readonly isDarkSystem = toSignal(
        isPlatformBrowser(this.platformId)
            ? fromEvent<MediaQueryListEvent>(
                  this.document.defaultView!.matchMedia('(prefers-color-scheme: dark)'),
                  'change',
              ).pipe(
                  startWith(this.document.defaultView!.matchMedia('(prefers-color-scheme: dark)')),
                  map(e => e.matches),
              )
            : of(false),
        {initialValue: false},
    );

    private readonly isDark = computed(() => {
        return (
            this.colorScheme() === ColorScheme.Dark || (this.colorScheme() === ColorScheme.Auto && this.isDarkSystem())
        );
    });

    private readonly _theme = signal<string>(this.allThemes[0]);

    /**
     * Currently selected theme. Use `setTheme()` to select a different theme.
     */
    public readonly theme = this._theme.asReadonly();

    private readonly _colorScheme = signal<ColorScheme>(ColorScheme.Auto);

    /**
     * Currently selected color scheme. Use `setColorScheme()` to select a different scheme.
     */
    public readonly colorScheme = this._colorScheme.asReadonly();

    public constructor() {
        effect(() => {
            this.htmlElement.setAttribute('data-is-dark', this.isDark() ? 'true' : 'false');
        });

        const storedScheme = this.storage.getItem('color-scheme') as ColorScheme | null;
        const isValidScheme = storedScheme && Object.values(ColorScheme).includes(storedScheme);
        this._colorScheme.set(isValidScheme ? storedScheme : ColorScheme.Auto);
    }

    /**
     * Set theme in memory and dom
     */
    public setTheme(theme: string): void {
        if (!this.allThemes.includes(theme)) {
            throw new Error(
                `Expecting one of the configured themes: ${this.allThemes.map(t => `'${t}'`).join(', ')}. But got invalid: '${theme}'`,
            );
        }

        this._theme.set(theme);
        this.htmlElement.setAttribute('data-theme', theme);
    }

    /**
     * Set dark/light/auto
     */
    public setColorScheme(scheme: ColorScheme, persistInStorage = true): void {
        this._colorScheme.set(scheme); // memory
        this.htmlElement.setAttribute('data-color-scheme', scheme); // dom

        if (persistInStorage) {
            this.storage.setItem('color-scheme', this.colorScheme()); // storage
        }
    }
}
