import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {clone} from 'lodash-es';
import {skip, takeUntil} from 'rxjs/operators';
import {NaturalAbstractController} from '../../../classes/abstract-controller';
import {Location} from '@angular/common';
import {Literal} from '../../../types/types';
import {SubscriptionLike} from 'rxjs';

/**
 * Returns the value from naturalLinkableTabName directive
 */
function getTabName(tab: MatTab): string {
    return tab.content?.viewContainerRef.element.nativeElement.getAttribute('naturallinkabletabname');
}

/**
 * Does nothing but needs to be declared to be valid attribute
 */
@Directive({
    selector: 'mat-tab[naturalLinkableTabName]',
})
export class NaturalLinkableTabNameDirective implements OnInit {
    @Input() public naturalLinkableTabName?: string;

    constructor(private component: MatTab, private element: ElementRef) {}

    public ngOnInit(): void {
        if (!this.naturalLinkableTabName) {
            this.element.nativeElement.setAttribute(
                'naturalLinkableTabName',
                this.component.textLabel.replace(' ', '').toLocaleLowerCase(),
            );
        }
    }
}

const defaultGroupKey = 'tab';

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
export class NaturalLinkableTabDirective extends NaturalAbstractController implements OnInit, OnDestroy, AfterViewInit {
    /**
     * If false, disables the persistent navigation
     * If string (default 'tab') is provided, it's used as key in url for that mat-tab-group
     */
    @Input() public naturalLinkableTab: string | false = defaultGroupKey;
    private locationSubscription: SubscriptionLike | null = null;
    private lastSelectionWasAutomatic = false;

    constructor(
        private readonly component: MatTabGroup,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly location: Location,
    ) {
        super();
    }

    public ngOnInit(): void {
        if (this.naturalLinkableTab === '') {
            this.naturalLinkableTab = defaultGroupKey;
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
            this.locationSubscription = null;
        }
    }

    private selectTab(tabName: string): void {
        // Get index of tab that matches wanted name
        const tabIndex = this.component._tabs.toArray().findIndex(tab => tabName === getTabName(tab));
        console.log('will select tab', tabIndex);
        this.component.selectedIndex = tabIndex;

        this.lastSelectionWasAutomatic = true;
    }

    public ngAfterViewInit(): void {
        if (this.naturalLinkableTab === false) {
            return;
        }

        const groupKey: string = this.naturalLinkableTab;

        // When component load, restore tab from URL if any
        const tabName = this.route.snapshot.params[groupKey];
        if (tabName) {
            this.selectTab(tabName);
        }

        // When location change (independent from Angular router), update the mat-tab-group selected tab
        this.locationSubscription = this.location.subscribe(event => {
            const paramsFromHistory = event.state?.naturalLinkableTabParams || {};
            const tabNameFromHistory = paramsFromHistory[groupKey] || '';
            console.log('url to tab: tabNameFromHistory', groupKey, paramsFromHistory, tabNameFromHistory);
            this.selectTab(tabNameFromHistory);
        });

        // When mat-tab-groups selected tab change, update url
        this.component.selectedTabChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event: MatTabChangeEvent) => {
            if (this.lastSelectionWasAutomatic) {
                this.lastSelectionWasAutomatic = false;
                return;
            }

            const activatedTabName = getTabName(event.tab);

            const segments = this.route.snapshot.url;
            if (!segments.length) {
                // This should never happen in normal usage, because it would means there is no route at all in the app
                throw new Error('Cannot update URL for tabs without any segments in URL');
            }

            // Get url matrix params only (/segment;matrix=param) without route params (segment/:id)
            const paramsFromRoute = clone(segments[segments.length - 1].parameters);
            const paramsFromHistory = (this.location.getState() as Literal)?.naturalLinkableTabParams || {};
            const params = {...paramsFromRoute, ...paramsFromHistory};
            console.log('params for manual tab selection', paramsFromRoute, paramsFromHistory, params);

            // Update params
            if (activatedTabName) {
                params[groupKey] = activatedTabName;
            } else {
                delete params[groupKey];
            }

            const url = this.router
                .createUrlTree(['.', params], {
                    relativeTo: this.route,
                    preserveFragment: true,
                    queryParamsHandling: 'preserve',
                })
                .toString();

            if (!this.location.isCurrentPathEqualTo(url)) {
                console.log('tab to url', groupKey, url, params);
                this.location.go(url, undefined, {naturalLinkableTabParams: params});
            }
        });
    }
}
