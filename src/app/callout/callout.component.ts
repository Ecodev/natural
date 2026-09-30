import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {
    type NaturalCalloutAppearance,
    type NaturalCalloutColor,
    NaturalCalloutComponent,
    type NaturalCalloutSize,
} from '../../../projects/natural/src/lib/modules/callout/callout.component';

type Sample = {
    color: NaturalCalloutColor | null;
    icon: string;
    message: string;
    detail: string;
};

type ContentCase = {
    label: string;
    icon: string | null;
    message: string;
    detail: string | null;
    amount: string | null;
    stacked: boolean;
};

@Component({
    imports: [MatButtonToggle, MatButtonToggleGroup, MatSlideToggle, NaturalCalloutComponent],
    templateUrl: './callout.component.html',
    styleUrl: './callout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalloutComponent {
    protected readonly sizes: readonly NaturalCalloutSize[] = ['small', 'medium', 'large'];
    protected readonly size = signal<NaturalCalloutSize>('small');
    protected readonly bold = signal(false);
    protected readonly appearances: readonly NaturalCalloutAppearance[] = ['plain', 'filled'];
    protected readonly colors: readonly (NaturalCalloutColor | null)[] = [
        null,
        'primary',
        'secondary',
        'tertiary',
        'error',
    ];
    protected readonly contentCases: readonly ContentCase[] = [
        {label: 'Text only', icon: null, message: 'Main line', detail: null, amount: null, stacked: false},
        {label: 'Icon', icon: 'info', message: 'Main line', detail: null, amount: null, stacked: false},
        {
            label: 'Icon and secondary line',
            icon: 'info',
            message: 'Main line',
            detail: 'Secondary line',
            amount: null,
            stacked: false,
        },
        {label: 'Icon and amount', icon: 'info', message: 'Main line', detail: null, amount: '42.50', stacked: false},
        {
            label: 'Amount without icon',
            icon: null,
            message: 'Main line',
            detail: 'Secondary line',
            amount: '42.50',
            stacked: false,
        },
        {
            label: 'Everything, on several lines',
            icon: 'info',
            message:
                'A main line long enough to wrap over several lines, so that the alignment of the icon, the text and the amount can be checked when the text takes more room than the rest of the callout',
            detail: 'Secondary line',
            amount: '42.50',
            stacked: true,
        },
    ];
    protected readonly samples: readonly Sample[] = [
        {
            color: null,
            icon: 'chat',
            message: 'Your order is being prepared',
            detail: 'A volunteer is filling your basket',
        },
        {
            color: 'primary',
            icon: 'local_shipping',
            message: 'Delivery scheduled for tomorrow',
            detail: 'Between 8:00 and 12:00',
        },
        {
            color: 'secondary',
            icon: 'deployed_code_history',
            message: 'Three products are back in stock',
            detail: 'Flour, lentils and olive oil',
        },
        {
            color: 'tertiary',
            icon: 'person',
            message: 'A new member joined the cooperative',
            detail: 'The first shift is next Monday',
        },
        {
            color: 'error',
            icon: 'warning',
            message: 'The payment was declined',
            detail: 'The card has expired',
        },
    ];
}
