import {CommonModule} from '@angular/common';
import {Component, DOCUMENT, ElementRef, inject, OnInit, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {copyToClipboard, LOCAL_STORAGE, NaturalAlertService} from '@ecodev/natural';

type ThemeToken = {
    name: string;
    hex: string;
};

type SchemeVariation =
    | 'light'
    | 'light-medium-contrast'
    | 'light-high-contrast'
    | 'dark'
    | 'dark-medium-contrast'
    | 'dark-high-contrast';

type MaterialTheme = {
    seed?: string;
    coreColors?: {
        primary?: string;
        secondary?: string;
        tertiary?: string;
        neutral?: string;
        neutralVariant?: string;
    };
    schemes?: Record<string, Record<string, string>>;
};

type ThemeData = {
    name: string;
    seed?: string;
    coreColors?: {
        primary?: string;
        secondary?: string;
        tertiary?: string;
        neutral?: string;
        neutralVariant?: string;
    };
    schemes: Record<string, Record<string, string>>;
    selectedVariations: Set<SchemeVariation>;
    tokensByVariation: Map<SchemeVariation, ThemeToken[]>;
};

@Component({
    selector: 'app-theme-merger',
    imports: [
        CommonModule,
        FormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatButton,
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
    protected readonly alertService = inject(NaturalAlertService);

    protected readonly theme2Upload = viewChild<ElementRef<HTMLInputElement>>('theme2Upload');

    protected theme1: ThemeData | null = null;
    protected theme2: ThemeData | null = null;
    private _themeName = 'natural';
    protected theme1RightColumnSelectedVariations = new Set<SchemeVariation>(['dark']);
    protected showPropertyNames = true;
    protected primary = '0086B2';
    protected tertiary = 'FF960B';

    private readonly THEME_NAME_STORAGE_KEY = 'theme-merger-theme-name';

    protected get themeName(): string {
        return this._themeName;
    }

    protected set themeName(value: string) {
        this._themeName = value;
        this.saveThemeNameToLocalStorage();
    }

    public ngOnInit(): void {
        this.loadThemeNameFromLocalStorage();
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

    protected readonly lightVariations: SchemeVariation[] = ['light', 'light-medium-contrast', 'light-high-contrast'];
    protected readonly darkVariations: SchemeVariation[] = ['dark', 'dark-medium-contrast', 'dark-high-contrast'];
    protected readonly allVariations: SchemeVariation[] = [...this.lightVariations, ...this.darkVariations];

    private readonly tokenOrderReference: readonly (string | null)[] = [
        'primary',
        'primary-container',
        'primary-fixed',
        'primary-fixed-dim',
        'on-primary',
        'on-primary-container',
        'on-primary-fixed',
        'on-primary-fixed-variant',
        'inverse-primary',
        null,
        'secondary',
        'secondary-container',
        'secondary-fixed',
        'secondary-fixed-dim',
        'on-secondary',
        'on-secondary-container',
        'on-secondary-fixed',
        'on-secondary-fixed-variant',
        null,
        'tertiary',
        'tertiary-container',
        'tertiary-fixed',
        'tertiary-fixed-dim',
        'on-tertiary',
        'on-tertiary-container',
        'on-tertiary-fixed',
        'on-tertiary-fixed-variant',
        null,
        'error',
        'error-container',
        'on-error',
        'on-error-container',
        null,
        'surface',
        'surface-variant',
        'on-surface',
        'on-surface-variant',
        'surface-dim',
        'surface-bright',
        'surface-container-lowest',
        'surface-container-low',
        'surface-container',
        'surface-container-high',
        'surface-container-highest',
        'surface-tint',
        'inverse-surface',
        'inverse-on-surface',
        null,
        'background',
        'on-background',
        null,
        'outline',
        'outline-variant',
        'shadow',
        'scrim',
    ] as const;

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

    protected camelToKebab(str: string | null): string {
        if (!str) {
            return '';
        }
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
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
        return this.tokenOrderReference
            .map(tokenName => {
                if (tokenName === null) {
                    return null;
                }
                // Check if this token exists in the theme (comparing kebab-case)
                return kebabToOriginal.has(tokenName) ? kebabToOriginal.get(tokenName)! : null;
            })
            .filter(tokenName => tokenName !== null || this.tokenOrderReference.includes(tokenName));
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

    protected getRightThemeSelectedVariations(): Set<SchemeVariation> {
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

        if (!this.themeName.trim()) {
            this.alertService.error('Please enter a theme name.');
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

        // Create a map of kebab-case names to tokens
        const kebabToTheme1Token = new Map<string, ThemeToken>();
        const kebabToTheme2Token = new Map<string, ThemeToken>();
        theme1Tokens.forEach(t => kebabToTheme1Token.set(this.camelToKebab(t.name), t));
        theme2Tokens.forEach(t => kebabToTheme2Token.set(this.camelToKebab(t.name), t));

        // Build the SCSS properties using tokenOrderReference for ordering
        const properties: string[] = [];
        this.tokenOrderReference.forEach(kebabName => {
            // null values represent spacing
            if (kebabName === null) {
                properties.push('');
                return;
            }

            // Only include tokens that exist in both themes
            const theme1Token = kebabToTheme1Token.get(kebabName);
            const theme2Token = kebabToTheme2Token.get(kebabName);

            if (theme1Token && theme2Token) {
                properties.push(`            ${kebabName}: light-dark(${theme1Token.hex}, ${theme2Token.hex})`);
            }
        });

        // Build comment with seed and coreColors
        const commentLines: string[] = [];

        // If using only one theme with different variations
        if (!this.theme2) {
            if (this.theme1.seed || this.theme1.coreColors) {
                commentLines.push(`Theme 1 (${theme1Variation} + ${theme2Variation}):`);
                if (this.theme1.seed) {
                    commentLines.push(`  Seed: ${this.theme1.seed}`);
                }
                if (this.theme1.coreColors) {
                    commentLines.push(`  Core Colors:`);
                    if (this.theme1.coreColors.primary) {
                        commentLines.push(`    Primary: ${this.theme1.coreColors.primary}`);
                    }
                    if (this.theme1.coreColors.secondary) {
                        commentLines.push(`    Secondary: ${this.theme1.coreColors.secondary}`);
                    }
                    if (this.theme1.coreColors.tertiary) {
                        commentLines.push(`    Tertiary: ${this.theme1.coreColors.tertiary}`);
                    }
                    if (this.theme1.coreColors.neutral) {
                        commentLines.push(`    Neutral: ${this.theme1.coreColors.neutral}`);
                    }
                    if (this.theme1.coreColors.neutralVariant) {
                        commentLines.push(`    Neutral Variant: ${this.theme1.coreColors.neutralVariant}`);
                    }
                }
            }
        } else {
            // Using two different themes
            // Add theme 1 info
            if (this.theme1.seed || this.theme1.coreColors) {
                commentLines.push(`Theme 1 (${theme1Variation}):`);
                if (this.theme1.seed) {
                    commentLines.push(`  Seed: ${this.theme1.seed}`);
                }
                if (this.theme1.coreColors) {
                    commentLines.push(`  Core Colors:`);
                    if (this.theme1.coreColors.primary) {
                        commentLines.push(`    Primary: ${this.theme1.coreColors.primary}`);
                    }
                    if (this.theme1.coreColors.secondary) {
                        commentLines.push(`    Secondary: ${this.theme1.coreColors.secondary}`);
                    }
                    if (this.theme1.coreColors.tertiary) {
                        commentLines.push(`    Tertiary: ${this.theme1.coreColors.tertiary}`);
                    }
                    if (this.theme1.coreColors.neutral) {
                        commentLines.push(`    Neutral: ${this.theme1.coreColors.neutral}`);
                    }
                    if (this.theme1.coreColors.neutralVariant) {
                        commentLines.push(`    Neutral Variant: ${this.theme1.coreColors.neutralVariant}`);
                    }
                }
            }

            // Add theme 2 info
            if (this.theme2.seed || this.theme2.coreColors) {
                if (commentLines.length > 0) {
                    commentLines.push('');
                }
                commentLines.push(`Theme 2 (${theme2Variation}):`);
                if (this.theme2.seed) {
                    commentLines.push(`  Seed: ${this.theme2.seed}`);
                }
                if (this.theme2.coreColors) {
                    commentLines.push(`  Core Colors:`);
                    if (this.theme2.coreColors.primary) {
                        commentLines.push(`    Primary: ${this.theme2.coreColors.primary}`);
                    }
                    if (this.theme2.coreColors.secondary) {
                        commentLines.push(`    Secondary: ${this.theme2.coreColors.secondary}`);
                    }
                    if (this.theme2.coreColors.tertiary) {
                        commentLines.push(`    Tertiary: ${this.theme2.coreColors.tertiary}`);
                    }
                    if (this.theme2.coreColors.neutral) {
                        commentLines.push(`    Neutral: ${this.theme2.coreColors.neutral}`);
                    }
                    if (this.theme2.coreColors.neutralVariant) {
                        commentLines.push(`    Neutral Variant: ${this.theme2.coreColors.neutralVariant}`);
                    }
                }
            }
        }

        // Generate Material Theme Builder links
        if (this.theme1.coreColors) {
            const url1 = this.generateThemeBuilderUrl(this.theme1.coreColors);
            if (url1) {
                commentLines.push('');
                commentLines.push(`Theme 1 Builder Link:`);
                commentLines.push(`  ${url1}`);
            }
        }
        if (this.theme2?.coreColors) {
            const url2 = this.generateThemeBuilderUrl(this.theme2.coreColors);
            if (url2) {
                commentLines.push('');
                commentLines.push(`Theme 2 Builder Link:`);
                commentLines.push(`  ${url2}`);
            }
        }

        const comment =
            commentLines.length > 0 ? `/*\n${commentLines.map(line => ' * ' + line).join('\n')}\n */\n\n` : '';

        // Generate SCSS - handle commas properly (don't add comma to empty lines)
        const propertiesString = properties
            .map((prop, index) => {
                if (prop === '') {
                    // Empty line for spacing
                    return '';
                }
                // Add comma to all properties except the last non-empty one
                const remainingProps = properties.slice(index + 1);
                const hasMoreProps = remainingProps.some(p => p !== '');
                return hasMoreProps ? `${prop},` : prop;
            })
            .join('\n');

        const defaultSelector = isDefault ? ':root, :host,' : '';
        const scss = `${comment}@use '@angular/material' as mat;
/* prettier-ignore */
${defaultSelector}
[data-theme="${this.themeName.trim()}"] {
    @include mat.theme-overrides((
    ${propertiesString}
    ));
}`;

        // Copy to clipboard
        try {
            copyToClipboard(this.document, scss);
            this.alertService.info('SCSS copied to clipboard!');
        } catch (error) {
            this.alertService.error('Failed to copy to clipboard. Please check browser permissions.');
        }
    }

    private generateThemeBuilderUrl(coreColors: NonNullable<ThemeData['coreColors']>): string {
        const baseUrl = 'http://material-foundation.github.io/material-theme-builder/';
        const params = new URLSearchParams();

        if (coreColors.primary) {
            params.append('primary', coreColors.primary.replace('#', ''));
        }
        if (coreColors.secondary) {
            params.append('secondary', coreColors.secondary.replace('#', ''));
        }
        if (coreColors.tertiary) {
            params.append('tertiary', coreColors.tertiary.replace('#', ''));
        }
        if (coreColors.neutral) {
            params.append('neutral', coreColors.neutral.replace('#', ''));
        }
        if (coreColors.neutralVariant) {
            params.append('neutralVariant', coreColors.neutralVariant.replace('#', ''));
        }

        return params.toString() ? `${baseUrl}?${params.toString()}` : '';
    }

    protected copyBuilderLink(): void {
        if (!this.primary.trim() && !this.tertiary.trim()) {
            this.alertService.error('Please enter at least a primary or tertiary color.');
            return;
        }

        const baseUrl = 'http://material-foundation.github.io/material-theme-builder/';
        const params = new URLSearchParams();

        // Add primary color if provided
        if (this.primary.trim()) {
            params.append('primary', this.primary.replace('#', '').toUpperCase());
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
