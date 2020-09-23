import {AfterViewInit, Directive, Input} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {clone} from 'lodash-es';
import {skip, takeUntil} from 'rxjs/operators';
import {NaturalAbstractController} from '../../../classes/abstract-controller';

/**
 * Returns and identifier for the tab
 */
function getTabName(tab: MatTab): string {
    const id = tab.content?.viewContainerRef.element.nativeElement.id;

    // Return id if defined or cleaned up tab label
    return id ?? tab.textLabel.replace(' ', '').toLocaleLowerCase();
}

/**
 * Usage :
 *
 * <mat-tab-group [naturalLinkableTab]="isPanel ? false : 'myTabGroup'">
 *     <mat-tab label="Third 1">third 1</mat-tab> // First tab doesn't need naturalLinkableTabName. This keeps url clean on default one
 *     <mat-tab label="Third 2" naturalLinkableTabName="third2">Third 2</mat-tab>
 *     ...
 * </mat-tab-group>
 */
@Directive({
    selector: 'mat-tab-group[naturalLinkableTab]',
})
export class NaturalLinkableTabDirective extends NaturalAbstractController implements AfterViewInit {
    /**
     * If false, disables the persistent navigation
     * If string (default 'tab') is provided, it's used as key in url for that mat-tab-group
     */
    @Input() public naturalLinkableTab = true;

    constructor(
        private readonly component: MatTabGroup,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) {
        super();
    }

    public ngAfterViewInit(): void {
        if (!this.naturalLinkableTab) {
            return;
        }

        // When url params change, update the mat-tab-group selected tab
        this.route.fragment.pipe(takeUntil(this.ngUnsubscribe)).subscribe(fragment => {
            // Get index of tab that matches wanted name
            const tabIndex = this.getTabIndex(fragment);

            // If tab index is valid (>= 0) go to given fragment
            // If there is no fragment at all, go to first tab (index is -1 in this case)
            if (tabIndex >= 0 || !fragment) {
                this.component.selectedIndex = tabIndex;
            }
        });

        // When mat-tab-groups selected tab change, update url
        // Skip() prevents initial navigation (get from url and apply) to be followed by an useless navigation that can close all panels
        const hasParams = this.getTabIndex(this.route.snapshot.fragment) > -1 ? 1 : 0;
        this.component.selectedTabChange
            .pipe(takeUntil(this.ngUnsubscribe), skip(hasParams))
            .subscribe((event: MatTabChangeEvent) => {
                const activatedTabName = getTabName(event.tab);

                const segments = this.route.snapshot.url;
                if (!segments.length) {
                    // This should never happen in normal usage, because it would means there is no route at all in the app
                    throw new Error('Cannot update URL for tabs without any segments in URL');
                }

                // Get url matrix params (/segment;matrix=param) only without route params (segment/:id)
                const params = clone(segments[segments.length - 1].parameters);

                this.router.navigate(['.', params], {
                    relativeTo: this.route,
                    queryParamsHandling: 'preserve',
                    fragment: activatedTabName && activatedTabName.length ? activatedTabName : undefined,
                });
            });
    }

    private getTabIndex(fragment: string): number {
        return this.component._tabs.toArray().findIndex(tab => fragment === getTabName(tab));
    }
}
