import {Directive, HostListener, input} from '@angular/core';
import {AbstractControl} from '@angular/forms';

/**
 * Need to add http:// prefix if we don't have prefix already AND we don't have part of it
 */
export function ensureHttpPrefix(value: string | null): string | null {
    if (!value) {
        return value;
    }

    const completePrefix = /^(https?):\/\//i.test(value);
    const startingPrefix = 'https://'.startsWith(value) || 'http://'.startsWith(value);

    if (!completePrefix && !startingPrefix) {
        return 'http://' + value;
    } else {
        return value;
    }
}

/**
 * This directive only supports ReactiveForms due to ngModel/ngControl encapsulation and changes emissions.
 */
@Directive({
    selector: '[naturalHttpPrefix]',
})
export class NaturalHttpPrefixDirective {
    public readonly naturalHttpPrefix = input<AbstractControl | null>(null);

    @HostListener('ngModelChange', ['$event'])
    public httpize($event: string): void {
        const naturalHttpPrefix = this.naturalHttpPrefix();
        if (naturalHttpPrefix) {
            const newValue = ensureHttpPrefix($event) || $event;
            if ($event !== newValue) {
                naturalHttpPrefix.setValue(newValue);
            }
        }
    }
}
