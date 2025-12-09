import {isPlatformBrowser} from '@angular/common';
import {
    computed,
    DOCUMENT,
    effect,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    PLATFORM_ID,
    provideAppInitializer,
    Provider,
    signal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {fromEvent, map, of} from 'rxjs';
import {startWith} from 'rxjs/operators';
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
    public readonly theme = this._theme.asReadonly();

    private readonly _colorScheme = signal<ColorScheme>(ColorScheme.Auto);
    public readonly colorScheme = this._colorScheme.asReadonly();

    public constructor() {
        effect(() => {
            this.document.documentElement.setAttribute('data-is-dark', this.isDark() ? 'true' : 'false');
        });

        const storedScheme = this.storage.getItem('color-scheme') as ColorScheme | null;
        const isValidScheme = storedScheme && Object.values(ColorScheme).includes(storedScheme);
        this._colorScheme.set(isValidScheme ? storedScheme : ColorScheme.Auto);
    }

    /**
     * Set theme in memory, local storage and dom
     */
    public setTheme(name: string): void {
        this._theme.set(name);
        this.document.documentElement.setAttribute('data-theme', name);
    }

    /**
     * Set dark/light/auto
     */
    public setColorScheme(scheme: ColorScheme, persistInStorage = true): void {
        this._colorScheme.set(scheme); // memory
        this.document.documentElement.setAttribute('data-color-scheme', scheme); // dom

        if (persistInStorage) {
            this.storage.setItem('color-scheme', this.colorScheme()); // storage
        }
    }
}
