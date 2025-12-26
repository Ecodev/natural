export type ThemeToken = {
    name: string;
    hex: string;
};

export type SchemeVariation =
    | 'light'
    | 'light-medium-contrast'
    | 'light-high-contrast'
    | 'dark'
    | 'dark-medium-contrast'
    | 'dark-high-contrast';

export type MaterialTheme = {
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

export type ThemeData = {
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

export const tokenOrderReference: readonly (string | null)[] = [
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

export function generateScss(
    themeName: string,
    theme1: ThemeData,
    theme2: ThemeData | null,
    theme1Tokens: ThemeToken[],
    theme2Tokens: ThemeToken[],
    theme1Variation: SchemeVariation,
    theme2Variation: SchemeVariation,
    isDefault: boolean,
    lightModeEnabled: boolean,
    darkModeEnabled: boolean,
): string {
    let themOverride = generateThemOverride(
        themeName,
        theme1Tokens,
        theme2Tokens,
        isDefault,
        lightModeEnabled,
        darkModeEnabled,
    );

    if (lightModeEnabled && darkModeEnabled) {
        const themOverrideSingleColor = generateThemOverride(
            themeName,
            theme1Tokens,
            theme2Tokens,
            isDefault,
            lightModeEnabled,
            false,
        );

        themOverride = `
        // Only light color for old browsers that don't support light-dark()
        ${themOverrideSingleColor}

        // Both colors for new browsers that support light-dark()
        @supports (color: light-dark(white, black)) {
            ${themOverride}
        }`;
    }

    const comment = generateComment(theme1, theme1Variation, theme2, theme2Variation);

    const scss = `${comment}@use '@angular/material' as mat;
${themOverride}
`;

    return scss;
}
function generateThemOverride(
    themeName: string,
    theme1Tokens: ThemeToken[],
    theme2Tokens: ThemeToken[],
    isDefault: boolean,
    lightModeEnabled: boolean,
    darkModeEnabled: boolean,
): string {
    // Create a map of kebab-case names to tokens
    const kebabToTheme1Token = new Map<string, ThemeToken>();
    const kebabToTheme2Token = new Map<string, ThemeToken>();
    theme1Tokens.forEach(t => kebabToTheme1Token.set(camelToKebab(t.name), t));
    theme2Tokens.forEach(t => kebabToTheme2Token.set(camelToKebab(t.name), t));

    // Build the SCSS properties using tokenOrderReference for ordering
    const properties: string[] = [];
    tokenOrderReference.forEach(kebabName => {
        // null values represent spacing
        if (kebabName === null) {
            properties.push('');
            return;
        }

        // Only include tokens that exist in the required themes
        const theme1Token = kebabToTheme1Token.get(kebabName);
        const theme2Token = kebabToTheme2Token.get(kebabName);

        // Generate CSS based on which modes are enabled
        if (lightModeEnabled && darkModeEnabled) {
            // Both modes: use light-dark()
            if (theme1Token && theme2Token) {
                properties.push(`            ${kebabName}: light-dark(${theme1Token.hex}, ${theme2Token.hex})`);
            }
        } else if (lightModeEnabled) {
            // Light mode only: use only theme1 color
            if (theme1Token) {
                properties.push(`            ${kebabName}: ${theme1Token.hex}`);
            }
        } else if (darkModeEnabled) {
            // Dark mode only: use only theme2 color
            if (theme2Token) {
                properties.push(`            ${kebabName}: ${theme2Token.hex}`);
            }
        }
    });

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

    // Build the selector based on whether a theme name is provided
    let selector: string;
    if (!themeName) {
        // No theme name: use only :root, :host
        selector = isDefault ? ':root, :host' : ':host';
    } else {
        // Theme name provided: include the data-theme selector
        const defaultSelector = isDefault ? ':root, :host,' : '';
        selector = defaultSelector + `\n[data-theme="${themeName}"]`;
    }

    const themOverride = `/* prettier-ignore */
${selector} {
    @include mat.theme-overrides((
    ${propertiesString}
    ));
}`;
    return themOverride;
}

function generateComment(
    theme1: ThemeData,
    theme1Variation: SchemeVariation,
    theme2: ThemeData | null,
    theme2Variation: SchemeVariation,
): string {
    // Build comment with seed and coreColors
    const commentLines: string[] = [];

    // If using only one theme with different variations
    if (!theme2) {
        if (theme1.seed || theme1.coreColors) {
            commentLines.push(`Theme 1 (${theme1Variation} + ${theme2Variation}):`);
            if (theme1.seed) {
                commentLines.push(`  Seed: ${theme1.seed}`);
            }
            if (theme1.coreColors) {
                commentLines.push(`  Core Colors:`);
                if (theme1.coreColors.primary) {
                    commentLines.push(`    Primary: ${theme1.coreColors.primary}`);
                }
                if (theme1.coreColors.secondary) {
                    commentLines.push(`    Secondary: ${theme1.coreColors.secondary}`);
                }
                if (theme1.coreColors.tertiary) {
                    commentLines.push(`    Tertiary: ${theme1.coreColors.tertiary}`);
                }
                if (theme1.coreColors.neutral) {
                    commentLines.push(`    Neutral: ${theme1.coreColors.neutral}`);
                }
                if (theme1.coreColors.neutralVariant) {
                    commentLines.push(`    Neutral Variant: ${theme1.coreColors.neutralVariant}`);
                }
            }
        }
    } else {
        // Using two different themes
        // Add theme 1 info
        if (theme1.seed || theme1.coreColors) {
            commentLines.push(`Theme 1 (${theme1Variation}):`);
            if (theme1.seed) {
                commentLines.push(`  Seed: ${theme1.seed}`);
            }
            if (theme1.coreColors) {
                commentLines.push(`  Core Colors:`);
                if (theme1.coreColors.primary) {
                    commentLines.push(`    Primary: ${theme1.coreColors.primary}`);
                }
                if (theme1.coreColors.secondary) {
                    commentLines.push(`    Secondary: ${theme1.coreColors.secondary}`);
                }
                if (theme1.coreColors.tertiary) {
                    commentLines.push(`    Tertiary: ${theme1.coreColors.tertiary}`);
                }
                if (theme1.coreColors.neutral) {
                    commentLines.push(`    Neutral: ${theme1.coreColors.neutral}`);
                }
                if (theme1.coreColors.neutralVariant) {
                    commentLines.push(`    Neutral Variant: ${theme1.coreColors.neutralVariant}`);
                }
            }
        }

        // Add theme 2 info
        if (theme2.seed || theme2.coreColors) {
            if (commentLines.length > 0) {
                commentLines.push('');
            }
            commentLines.push(`Theme 2 (${theme2Variation}):`);
            if (theme2.seed) {
                commentLines.push(`  Seed: ${theme2.seed}`);
            }
            if (theme2.coreColors) {
                commentLines.push(`  Core Colors:`);
                if (theme2.coreColors.primary) {
                    commentLines.push(`    Primary: ${theme2.coreColors.primary}`);
                }
                if (theme2.coreColors.secondary) {
                    commentLines.push(`    Secondary: ${theme2.coreColors.secondary}`);
                }
                if (theme2.coreColors.tertiary) {
                    commentLines.push(`    Tertiary: ${theme2.coreColors.tertiary}`);
                }
                if (theme2.coreColors.neutral) {
                    commentLines.push(`    Neutral: ${theme2.coreColors.neutral}`);
                }
                if (theme2.coreColors.neutralVariant) {
                    commentLines.push(`    Neutral Variant: ${theme2.coreColors.neutralVariant}`);
                }
            }
        }
    }

    // Generate Material Theme Builder links
    if (theme1.coreColors) {
        const url1 = generateThemeBuilderUrl(theme1.coreColors);
        if (url1) {
            commentLines.push('');
            commentLines.push(`Theme 1 Builder Link:`);
            commentLines.push(`  ${url1}`);
        }
    }
    if (theme2?.coreColors) {
        const url2 = generateThemeBuilderUrl(theme2.coreColors);
        if (url2) {
            commentLines.push('');
            commentLines.push(`Theme 2 Builder Link:`);
            commentLines.push(`  ${url2}`);
        }
    }

    const comment = commentLines.length > 0 ? `/*\n${commentLines.map(line => ' * ' + line).join('\n')}\n */\n\n` : '';
    return comment;
}

function generateThemeBuilderUrl(coreColors: NonNullable<ThemeData['coreColors']>): string {
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

    params.append('colorMatch', 'true');

    return params.toString() ? `${baseUrl}?${params.toString()}` : '';
}

export function camelToKebab(str: string | null): string {
    if (!str) {
        return '';
    }
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
