import {ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation} from '@angular/core';
import {Params, QueryParamsHandling, RouterLink, UrlTree} from '@angular/router';
import {ThemePalette} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import {NaturalIconDirective} from '../icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {Subject} from 'rxjs';
import {outputFromObservable} from '@angular/core/rxjs-interop';

/**
 * Button that fits well in a `<mat-table>` and support either
 * route navigation via `navigate`, or external URL via `href`,
 * or callback via `buttonClick`.
 *
 * If neither `navigate` nor `href` nor `buttonClick` have a meaningful value, then
 * it will show the icon and/or label in a `<span>` instead of a button.
 *
 * External URL will always be opened in new tab.
 */
@Component({
    selector: 'natural-table-button',
    imports: [MatIconModule, NaturalIconDirective, MatButtonModule, RouterLink],
    templateUrl: './table-button.component.html',
    styleUrl: './table-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
})
export class NaturalTableButtonComponent {
    public readonly queryParams = input<Params>({});
    public readonly queryParamsHandling = input<QueryParamsHandling>('');
    public readonly label = input<string | null | undefined>();
    public readonly icon = input<string | null | undefined>();
    public readonly href = input<string | null | undefined>();
    public readonly navigate = input<RouterLink['routerLink']>([]);
    public readonly fragment = input<string | undefined>();
    public readonly preserveFragment = input(false);
    public readonly disabled = input(false);
    public readonly raised = input(false);
    public readonly color = input<ThemePalette>();

    protected readonly buttonClick$ = new Subject<MouseEvent>();
    public readonly buttonClick = outputFromObservable(this.buttonClick$);

    protected readonly type = computed(() => {
        const navigate = this.navigate();
        if (navigate instanceof UrlTree || navigate?.length || Object.keys(this.queryParams()).length) {
            return 'routerLink';
        } else if (this.href()) {
            return 'href';
        } else if (this.buttonClick$.observed) {
            return 'click';
        } else {
            return 'none';
        }
    });
}
