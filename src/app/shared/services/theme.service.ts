import {DOCUMENT, inject, Injectable, signal} from '@angular/core';
import {LOCAL_STORAGE} from '@ecodev/natural';

export const allThemes = ['natural-theme', 'alternative-theme'] as const;

export type Theme = (typeof allThemes)[number];

export enum ColorScheme {
    Light = 'light',
    Dark = 'dark',
    Auto = 'light dark',
}

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly document = inject(DOCUMENT);

    private readonly storage = inject(LOCAL_STORAGE);
    public readonly theme = signal<Theme>(allThemes[0]);
    public readonly colorScheme = signal<ColorScheme>(ColorScheme.Light);

    public constructor() {
        const theme = this.storage.getItem('theme') as Theme;
        this.setTheme(theme);

        const storedScheme = this.storage.getItem('color-scheme') as ColorScheme | null;
        const preferredScheme = this.getPreferredColorScheme();
        this.setColorScheme(storedScheme ?? preferredScheme);
    }

    private getPreferredColorScheme(): ColorScheme {
        const window = this.document.defaultView;
        if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
            return ColorScheme.Dark;
        }
        return ColorScheme.Light;
    }

    public setTheme(name: Theme): void {
        this.theme.set(name);
        this.storage.setItem('theme', name);
    }

    public setColorScheme(scheme: ColorScheme): void {
        this.colorScheme.set(scheme);
        this.storage.setItem('color-scheme', this.colorScheme());
        this.document.documentElement.style.colorScheme = scheme;
    }
}
