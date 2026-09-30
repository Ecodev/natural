import {CurrencyPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, DEFAULT_CURRENCY_CODE, inject, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {NaturalIconDirective} from '../icon/icon.directive';

export type NaturalCalloutColor = 'primary' | 'secondary' | 'tertiary' | 'error';
export type NaturalCalloutAppearance = 'plain' | 'filled';
export type NaturalCalloutSize = 'small' | 'medium' | 'large';

/**
 * A text that stands out, with an icon and an amount read at a glance, both optional.
 *
 * The color is the same in every size and appearance: the text and the icon take the color, and a
 * filled callout takes the fixed variant of the color for its background. The size only sets the spacing and the typography. A
 * `small` element within the text adds a secondary line.
 *
 * Usage:
 *
 * ```html
 * <natural-callout icon="warning" color="error">The payment was declined</natural-callout>
 * <natural-callout icon="payments" amount="42.50" appearance="filled" size="large">
 *     Total<small>VAT included</small>
 * </natural-callout>
 * ```
 */
@Component({
    selector: 'natural-callout',
    imports: [CurrencyPipe, MatIcon, NaturalIconDirective],
    templateUrl: './callout.component.html',
    styleUrl: './callout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class]': "[color(), appearance(), size()].join(' ')",
        '[class.without-icon]': '!icon()',
    },
})
export class NaturalCalloutComponent {
    protected readonly currency = inject(DEFAULT_CURRENCY_CODE);

    public readonly icon = input<string | null>(null);
    public readonly amount = input<number | string | null>(null);
    public readonly color = input<NaturalCalloutColor | null>(null);
    public readonly appearance = input<NaturalCalloutAppearance>('plain');
    public readonly size = input<NaturalCalloutSize>('small');
}
