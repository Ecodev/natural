import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
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
    amount: string;
};

@Component({
    imports: [MatButtonToggle, MatButtonToggleGroup, NaturalCalloutComponent],
    templateUrl: './callout.component.html',
    styleUrl: './callout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalloutComponent {
    protected readonly sizes: readonly NaturalCalloutSize[] = ['small', 'medium', 'large'];
    protected readonly size = signal<NaturalCalloutSize>('small');
    protected readonly appearances: readonly NaturalCalloutAppearance[] = ['plain', 'filled'];
    protected readonly samples: readonly Sample[] = [
        {
            color: null,
            icon: 'chat',
            message: 'Your order is being prepared',
            detail: 'A volunteer is filling your basket',
            amount: '18.40',
        },
        {
            color: 'primary',
            icon: 'local_shipping',
            message: 'Delivery scheduled for tomorrow',
            detail: 'Between 8:00 and 12:00',
            amount: '124.90',
        },
        {
            color: 'secondary',
            icon: 'deployed_code_history',
            message: 'Three products are back in stock',
            detail: 'Flour, lentils and olive oil',
            amount: '7.25',
        },
        {
            color: 'tertiary',
            icon: 'person',
            message: 'A new member joined the cooperative',
            detail: 'The first shift is next Monday',
            amount: '50.00',
        },
        {
            color: 'error',
            icon: 'warning',
            message: 'The payment was declined',
            detail: 'The card has expired',
            amount: '-32.60',
        },
    ];
}
