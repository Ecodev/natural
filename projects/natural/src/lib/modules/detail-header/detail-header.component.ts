import {Component, Input, input} from '@angular/core';
import {Literal, NameOrFullName} from '../../types/types';
import {NaturalIconDirective} from '../icon/icon.directive';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
    selector: 'natural-detail-header',
    imports: [MatButton, RouterLink, MatIcon, NaturalIconDirective],
    templateUrl: './detail-header.component.html',
    styleUrl: './detail-header.component.scss',
})
export class NaturalDetailHeaderComponent {
    /**
     * Base URL used to build links, defaults to '/'
     */
    public readonly currentBaseUrl = input<string>();

    /**
     * Must be set to get proper links when used in panels
     */
    public readonly isPanel = input(false);

    /**
     * If given will show icon before title
     */
    @Input() public icon = '';
    /**
     * Title shown if model has no name, or empty name.
     *
     * Typically should be the human name for the object type, eg: 'Product'
     */
    @Input() public label = '';

    /**
     * Label of the root of the breadcrumb, defaults to the value of `label`.
     *
     * Typically should be the plural form of the object type, eg: 'Products'
     */
    @Input() public rootLabel = '';

    /**
     * Title shown if model has no id.
     *
     * Typically should be similar to 'New product'.
     */
    public readonly newLabel = input('');
    @Input({required: true}) public model!: Literal;
    public readonly breadcrumbs = input<NameOrFullName[]>([]);
    public readonly listRoute = input<any[]>([]);
    public readonly listFragment = input<string>();
    public readonly link = input<(id: string) => any[]>();

    public getRootLink(): string[] {
        return [this.currentBaseUrl() || '/'].concat(this.listRoute());
    }

    public getLink(id: string): any[] {
        const link = this.link();
        if (link) {
            return this.getRootLink().concat(link(id));
        }

        return this.getRootLink().concat([id]);
    }
}
