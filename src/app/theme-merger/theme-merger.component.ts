import {CommonModule} from '@angular/common';
import {Component, DOCUMENT, ElementRef, inject, OnInit, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {copyToClipboard, LOCAL_STORAGE, NaturalAlertService} from '@ecodev/natural';
import {
    camelToKebab,
    generateScss,
    type MaterialTheme,
    type SchemeVariation,
    type ThemeData,
    type ThemeToken,
    tokenOrderReference,
} from './theme-merger.utils';

@Component({
    selector: 'app-theme-merger',
    imports: [
        CommonModule,
        FormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatButton,
        MatCheckbox,
        MatIcon,
        MatIconButton,
        MatSuffix,
        MatTooltip,
    ],
    templateUrl: './theme-merger.component.html',
    styleUrl: './theme-merger.component.scss',
})
export class ThemeMergerComponent implements OnInit {
    private readonly document = inject(DOCUMENT);
    private readonly localStorage = inject(LOCAL_STORAGE);
    private readonly alertService = inject(NaturalAlertService);
    private readonly theme2Upload = viewChild<ElementRef<HTMLInputElement>>('theme2Upload');
    protected readonly camelToKebab = camelToKebab;

    protected theme1: ThemeData | null = null;
    protected theme2: ThemeData | null = null;
    private _themeName = 'natural';
    private theme1RightColumnSelectedVariations = new Set<SchemeVariation>(['dark']);
    protected showPropertyNames = true;
    protected primary = '0086B2';
    protected secondary = '';
    protected tertiary = 'FF960B';
    private _lightModeEnabled = true;
    private _darkModeEnabled = true;

    private readonly THEME_NAME_STORAGE_KEY = 'theme-merger-theme-name';
    private readonly LIGHT_MODE_STORAGE_KEY = 'theme-merger-light-mode';
    private readonly DARK_MODE_STORAGE_KEY = 'theme-merger-dark-mode';

    protected get themeName(): string {
        return this._themeName;
    }

    protected set themeName(value: string) {
        this._themeName = value;
        this.saveThemeNameToLocalStorage();
    }

    protected get lightModeEnabled(): boolean {
        return this._lightModeEnabled;
    }

    protected set lightModeEnabled(value: boolean) {
        this._lightModeEnabled = value;
        this.saveLightModeToLocalStorage();
    }

    protected get darkModeEnabled(): boolean {
        return this._darkModeEnabled;
    }

    protected set darkModeEnabled(value: boolean) {
        this._darkModeEnabled = value;
        this.saveDarkModeToLocalStorage();
    }

    public ngOnInit(): void {
        this.loadThemeNameFromLocalStorage();
        this.loadLightModeFromLocalStorage();
        this.loadDarkModeFromLocalStorage();
    }

    private loadThemeNameFromLocalStorage(): void {
        const savedThemeName = this.localStorage.getItem(this.THEME_NAME_STORAGE_KEY);
        if (savedThemeName) {
            this._themeName = savedThemeName;
        }
    }

    private saveThemeNameToLocalStorage(): void {
        this.localStorage.setItem(this.THEME_NAME_STORAGE_KEY, this._themeName);
    }

    private loadLightModeFromLocalStorage(): void {
        const savedLightMode = this.localStorage.getItem(this.LIGHT_MODE_STORAGE_KEY);
        if (savedLightMode !== null) {
            this._lightModeEnabled = savedLightMode === 'true';
        }
    }

    private saveLightModeToLocalStorage(): void {
        this.localStorage.setItem(this.LIGHT_MODE_STORAGE_KEY, String(this._lightModeEnabled));
    }

    private loadDarkModeFromLocalStorage(): void {
        const savedDarkMode = this.localStorage.getItem(this.DARK_MODE_STORAGE_KEY);
        if (savedDarkMode !== null) {
            this._darkModeEnabled = savedDarkMode === 'true';
        }
    }

    private saveDarkModeToLocalStorage(): void {
        this.localStorage.setItem(this.DARK_MODE_STORAGE_KEY, String(this._darkModeEnabled));
    }

    private readonly lightVariations: SchemeVariation[] = ['light', 'light-medium-contrast', 'light-high-contrast'];
    private readonly darkVariations: SchemeVariation[] = ['dark', 'dark-medium-contrast', 'dark-high-contrast'];
    private readonly allVariations: SchemeVariation[] = [...this.lightVariations, ...this.darkVariations];

    protected clearTheme2(): void {
        this.theme2 = null;
        // Reset the file input so the same file can be selected again
        const uploadInput = this.theme2Upload();
        if (uploadInput) {
            uploadInput.nativeElement.value = '';
        }
    }

    protected onFileSelected(event: Event, themeNumber: 1 | 2): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const content = e.target?.result as string;
                const theme = JSON.parse(content) as MaterialTheme;

                if (theme.schemes) {
                    const tokensByVariation = new Map<SchemeVariation, ThemeToken[]>();

                    // Parse all available variations
                    this.allVariations.forEach(variation => {
                        if (theme.schemes![variation]) {
                            tokensByVariation.set(variation, this.parseTokens(theme.schemes![variation]));
                        }
                    });

                    // Default to 'light' for theme 1, 'dark' for theme 2
                    const defaultVariation = themeNumber === 1 ? 'light' : 'dark';

                    const themeData: ThemeData = {
                        name: file.name,
                        seed: theme.seed,
                        coreColors: theme.coreColors,
                        schemes: theme.schemes,
                        selectedVariations: new Set([defaultVariation]),
                        tokensByVariation,
                    };

                    if (themeNumber === 1) {
                        this.theme1 = themeData;
                        // Set primary and tertiary from theme1's coreColors
                        if (themeData.coreColors) {
                            if (themeData.coreColors.primary) {
                                this.primary = themeData.coreColors.primary.replace('#', '');
                            }
                            if (themeData.coreColors.tertiary) {
                                this.tertiary = themeData.coreColors.tertiary.replace('#', '');
                            }
                        }
                    } else {
                        this.theme2 = themeData;
                    }

                    // Auto-generate and copy SCSS after file upload
                    // Use setTimeout to ensure the view is updated first
                    setTimeout(() => {
                        this.generateAndCopyScss(true);
                    }, 0);
                }
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                this.alertService.error(
                    'Error parsing JSON file. Please ensure it is a valid Material Design 3 theme file.',
                );
            }
        };

        reader.readAsText(file);
    }

    private parseTokens(lightScheme: Record<string, string>): ThemeToken[] {
        return Object.entries(lightScheme).map(([name, hex]) => ({
            name,
            hex: hex.startsWith('#') ? hex : `#${hex}`,
        }));
    }

    protected toggleVariation(theme: ThemeData, variation: SchemeVariation): void {
        if (theme.schemes[variation]) {
            if (theme.selectedVariations.has(variation)) {
                theme.selectedVariations.delete(variation);
            } else {
                theme.selectedVariations.add(variation);
            }
            // Trigger change detection by creating a new Set
            theme.selectedVariations = new Set(theme.selectedVariations);
        }
    }

    protected isVariationSelected(theme: ThemeData, variation: SchemeVariation): boolean {
        return theme.selectedVariations.has(variation);
    }

    protected getVariationLabel(variation: SchemeVariation): string {
        const labels: Record<SchemeVariation, string> = {
            light: 'Light',
            'light-medium-contrast': 'Light Medium',
            'light-high-contrast': 'Light High',
            dark: 'Dark',
            'dark-medium-contrast': 'Dark Medium',
            'dark-high-contrast': 'Dark High',
        };
        return labels[variation];
    }

    protected getTokenNames(theme: ThemeData): (string | null)[] {
        // Get token names from the first available variation
        const firstVariation = Array.from(theme.tokensByVariation.keys())[0];
        if (!firstVariation) {
            return [];
        }

        const tokens = theme.tokensByVariation.get(firstVariation);
        if (!tokens) {
            return [];
        }

        // Create a map of kebab-case names to original camelCase names
        const kebabToOriginal = new Map<string, string>();
        tokens.forEach(t => {
            const kebabName = this.camelToKebab(t.name);
            kebabToOriginal.set(kebabName, t.name);
        });

        // Return tokens in the order specified by tokenOrderReference
        // Include null values for spacing
        return tokenOrderReference
            .map(tokenName => {
                if (tokenName === null) {
                    return null;
                }
                // Check if this token exists in the theme (comparing kebab-case)
                return kebabToOriginal.has(tokenName) ? kebabToOriginal.get(tokenName)! : null;
            })
            .filter(tokenName => tokenName !== null || tokenOrderReference.includes(tokenName));
    }

    protected getTokensForName(theme: ThemeData, tokenName: string): {variation: SchemeVariation; token: ThemeToken}[] {
        const result: {variation: SchemeVariation; token: ThemeToken}[] = [];

        // Return tokens only for selected variations, in the order of variations array
        this.allVariations.forEach(variation => {
            if (theme.selectedVariations.has(variation)) {
                const tokens = theme.tokensByVariation.get(variation);
                const token = tokens?.find(t => t.name === tokenName);
                if (token) {
                    result.push({variation, token});
                }
            }
        });

        return result;
    }

    protected getVariationsForTheme(themeNumber: 1 | 2): SchemeVariation[] {
        return themeNumber === 1 ? this.lightVariations : this.darkVariations;
    }

    protected getRightTheme(): ThemeData {
        return this.theme2 ?? this.theme1!;
    }

    private getRightThemeSelectedVariations(): Set<SchemeVariation> {
        return this.theme2 ? this.theme2.selectedVariations : this.theme1RightColumnSelectedVariations;
    }

    protected isVariationSelectedRight(variation: SchemeVariation): boolean {
        return this.getRightThemeSelectedVariations().has(variation);
    }

    protected toggleVariationRight(variation: SchemeVariation): void {
        const rightTheme = this.getRightTheme();
        if (rightTheme.schemes[variation]) {
            if (this.theme2) {
                // Use theme2's own selected variations
                this.toggleVariation(this.theme2, variation);
            } else {
                // Use separate state for theme1 as right column
                if (this.theme1RightColumnSelectedVariations.has(variation)) {
                    this.theme1RightColumnSelectedVariations.delete(variation);
                } else {
                    this.theme1RightColumnSelectedVariations.add(variation);
                }
                // Trigger change detection
                this.theme1RightColumnSelectedVariations = new Set(this.theme1RightColumnSelectedVariations);
            }
        }
    }

    protected getTokensForNameRight(tokenName: string): {variation: SchemeVariation; token: ThemeToken}[] {
        const result: {variation: SchemeVariation; token: ThemeToken}[] = [];
        const rightTheme = this.getRightTheme();
        const selectedVariations = this.getRightThemeSelectedVariations();

        // Return tokens only for selected variations, in the order of variations array
        this.allVariations.forEach(variation => {
            if (selectedVariations.has(variation)) {
                const tokens = rightTheme.tokensByVariation.get(variation);
                const token = tokens?.find(t => t.name === tokenName);
                if (token) {
                    result.push({variation, token});
                }
            }
        });

        return result;
    }

    protected generateAndCopyScss(isDefault: boolean): void {
        if (!this.theme1) {
            this.alertService.error('Please upload at least Theme 1.');
            return;
        }

        const rightTheme = this.getRightTheme();

        // Check if at least one mode is enabled
        if (!this.lightModeEnabled && !this.darkModeEnabled) {
            this.alertService.error('Please enable at least one mode (Light or Dark).');
            return;
        }

        // Validate that exactly one variation is selected for each theme
        if (this.theme1.selectedVariations.size !== 1) {
            this.alertService.error('Please select exactly ONE variation for Theme 1.');
            return;
        }

        const rightThemeSelectedVariations = this.getRightThemeSelectedVariations();
        if (rightThemeSelectedVariations.size !== 1) {
            this.alertService.error(
                `Please select exactly ONE variation for ${this.theme2 ? 'Theme 2' : 'Theme 1 (right column)'}.`,
            );
            return;
        }

        // Get the selected variations
        const theme1Variation = Array.from(this.theme1.selectedVariations)[0];
        const theme2Variation = Array.from(rightThemeSelectedVariations)[0];

        // Get tokens from the selected variations
        const theme1Tokens = this.theme1.tokensByVariation.get(theme1Variation);
        const theme2Tokens = rightTheme.tokensByVariation.get(theme2Variation);

        if (!theme1Tokens || !theme2Tokens) {
            this.alertService.error('Error retrieving tokens from selected variations.');
            return;
        }

        const scss = generateScss(
            this.themeName.trim(),
            this.theme1,
            this.theme2,
            theme1Tokens,
            theme2Tokens,
            theme1Variation,
            theme2Variation,
            isDefault,
            this.lightModeEnabled,
            this.darkModeEnabled,
        );

        // Copy to clipboard
        try {
            copyToClipboard(this.document, scss);
            this.alertService.info('SCSS copied to clipboard!');
        } catch (error) {
            this.alertService.error('Failed to copy to clipboard. Please check browser permissions.');
        }
    }

    protected copyBuilderLink(): void {
        if (!this.primary.trim() && !this.secondary.trim() && !this.tertiary.trim()) {
            this.alertService.error('Please enter at least a primary, secondary, or tertiary color.');
            return;
        }

        const baseUrl = 'https://material-foundation.github.io/material-theme-builder/';
        const params = new URLSearchParams();

        // Add primary color if provided
        if (this.primary.trim()) {
            params.append('primary', this.primary.replace('#', '').toUpperCase());
        }

        // Add secondary color if provided
        if (this.secondary.trim()) {
            params.append('secondary', this.secondary.replace('#', '').toUpperCase());
        }

        // Add tertiary color if provided
        if (this.tertiary.trim()) {
            params.append('tertiary', this.tertiary.replace('#', '').toUpperCase());
        }

        // Force neutral and neutralVariant to white
        params.append('neutral', 'FFFFFF');
        params.append('neutralVariant', 'FFFFFF');
        params.append('colorMatch', 'true');

        const url = `${baseUrl}?${params.toString()}`;

        try {
            copyToClipboard(this.document, url);
            this.alertService.info('Theme Builder URL copied to clipboard!');
        } catch (error) {
            this.alertService.error('Failed to copy to clipboard. Please check browser permissions.');
        }
    }
}
