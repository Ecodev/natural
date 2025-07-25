import {Directive, HostBinding, inject, InjectionToken, Input} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

type NaturalIconType = {
    name: string;
    svg?: string;
    font?: string;
    class?: 'negative' | 'neutral' | 'positive';
};

export type NaturalIconConfig = {
    svg?: string;
    font?: string;
    class?: 'negative' | 'neutral' | 'positive';
};

export type NaturalIconsConfig = Record<string, NaturalIconConfig>;

export const NATURAL_ICONS_CONFIG = new InjectionToken<NaturalIconsConfig>('Configuration for Natural Icons');

const naturalRegistered: unique symbol = Symbol('Natural icon registered');

/**
 * Allows to use `<mat-icon>` without knowing where an icon comes from (SVG or font) or with aliases for Material font.
 *
 * SVG icons and Material font aliases must be configured ahead of time, via `NATURAL_ICONS_CONFIG`.
 *
 * It also make it easy to give a specific size to the icon via `[size]`.
 *
 * Usage:
 *
 * ```html
 * <mat-icon naturalIcon="search"></mat-icon>
 * <mat-icon naturalIcon="my-svg-icon-name"></mat-icon>
 * <mat-icon naturalIcon="my-alias-for-search"></mat-icon>
 * <mat-icon naturalIcon="search" [size]="150"></mat-icon>
 * ```
 */
@Directive({
    selector: 'mat-icon[naturalIcon]',
    standalone: true,
})
export class NaturalIconDirective {
    private readonly matIconRegistry = inject(MatIconRegistry);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly config = inject(NATURAL_ICONS_CONFIG, {optional: true});
    private readonly matIconComponent = inject(MatIcon, {host: true, self: true});

    @HostBinding('style.font-size.px')
    @HostBinding('style.min-height.px')
    @HostBinding('style.min-width.px')
    protected _size: number | undefined = undefined;

    @HostBinding('class') protected classes = '';

    public constructor() {
        const config = this.config;

        this.registerIcons(config ?? {});
    }

    @Input({required: true})
    public set naturalIcon(value: string) {
        const newIcon: NaturalIconType = {
            name: value,
            ...(this.config?.[value] ?? {font: value}),
        };

        if (newIcon.class) {
            this.classes = newIcon.class;
        }

        this.matIconComponent.fontIcon = undefined!;
        this.matIconComponent.svgIcon = undefined!;

        if (newIcon.font) {
            this.matIconComponent.fontIcon = newIcon.font;
        } else if (newIcon.svg) {
            this.matIconComponent.svgIcon = newIcon.name;
        }
    }

    @Input()
    public set size(size: number | undefined | null) {
        this._size = size ?? undefined;
    }

    private registerIcons(config: NaturalIconsConfig): void {
        // Ensure that this specific instance of registry has our our icons
        // exactly once, not less and not more
        const registry = this.matIconRegistry as any;
        if (registry[naturalRegistered]) {
            return;
        }
        registry[naturalRegistered] = true;

        for (const key of Object.keys(config)) {
            const svg = config[key].svg;
            if (svg) {
                this.matIconRegistry.addSvgIcon(key, this.domSanitizer.bypassSecurityTrustResourceUrl(svg));
            }
        }
    }
}
