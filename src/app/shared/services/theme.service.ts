import {computed, inject, Injectable, signal} from '@angular/core';
import {LOCAL_STORAGE} from '@ecodev/natural';

export const allThemes = ['default', 'defaultDark'] as const;
export type Theme = (typeof allThemes)[number];

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly storage = inject(LOCAL_STORAGE);
    private readonly isDark = signal(true);
    public readonly theme = computed<Theme>(() => (this.isDark() ? 'defaultDark' : 'default'));

    public constructor() {
        const theme = this.storage.getItem('theme') as Theme | null;
        this.set(!!theme?.includes('Dark'));
    }

    public set(isDark: boolean): void {
        this.isDark.set(isDark);
        this.storage.setItem('theme', this.theme());
    }

    public toggle(): void {
        this.set(!this.isDark());
    }
}
