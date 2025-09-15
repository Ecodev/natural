import {AfterViewInit, DestroyRef, Directive, inject, input} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, RouteConfigLoadEnd, RouteConfigLoadStart, Router} from '@angular/router';
import {clone} from 'es-toolkit';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Returns an identifier for the tab
 */
function getTabId(tab: MatTab): string {
    return tab.id ?? '';
}

/**
 * Usage :
 *
 * ```html
 * <mat-tab-group [naturalLinkableTab]="!isPanel">
 *     <mat-tab label="Tab 1">Tab 1</mat-tab> // First tab doesn't need id. This keeps url clean on default one
 *     <mat-tab label="Tab 2" id="second-tab">Tab 2</mat-tab>
 *     ...
 * </mat-tab-group>
 * ```
 */
@Directive({
    selector: 'mat-tab-group[naturalLinkableTab]',
})
export class NaturalLinkableTabDirective implements AfterViewInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly component = inject(MatTabGroup);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    /**
     * If false, disables the persistent navigation
     */
    public readonly naturalLinkableTab = input<boolean | ''>(true);
    private isLoadingRouteConfig = false;

    public constructor() {
        this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
            if (event instanceof RouteConfigLoadStart) {
                this.isLoadingRouteConfig = true;
            } else if (event instanceof RouteConfigLoadEnd) {
                this.isLoadingRouteConfig = false;
            }
        });
    }

    public ngAfterViewInit(): void {
        if (this.naturalLinkableTab() === false) {
            return;
        }

        // When url params change, update the mat-tab-group selected tab
        this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fragment => {
            // Get index of tab that matches wanted name
            const tabIndex = this.getTabIndex(fragment);

            // If tab index is valid (>= 0) go to given fragment
            // If there is no fragment at all, go to first tab (index is -1 in this case)
            if (tabIndex >= 0 || !fragment) {
                this.component.selectedIndex = tabIndex;
            }
        });

        // When mat-tab-groups selected tab change, update url
        this.component.selectedTabChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
            if (this.isLoadingRouteConfig) {
                return;
            }

            const activatedTabName = getTabId(event.tab);
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
                fragment: activatedTabName?.length ? activatedTabName : undefined,
            });
        });
    }

    private getTabIndex(fragment: string | null): number {
        return this.component._tabs.toArray().findIndex(tab => fragment === getTabId(tab));
    }
}
