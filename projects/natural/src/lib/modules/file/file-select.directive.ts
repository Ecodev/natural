import {Directive, input} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';

/**
 * This directive has all options to select files, except drag'n'drop.
 */
@Directive({
    selector: ':not([naturalFileDrop])[naturalFileSelect]',
    standalone: true,
})
export class NaturalFileSelectDirective extends NaturalAbstractFile {
    /**
     * Whether the user can click on the element to select something
     *
     * Override parent to enable it by default
     */
    public override readonly selectable = input(true);
}
