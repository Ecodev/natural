import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {ComponentType} from '@angular/cdk/portal';
import {inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ActivatedRoute, DefaultUrlSerializer, NavigationError, Router, UrlSegment} from '@angular/router';
import {differenceWith, flatten} from 'es-toolkit';
import {isEqual} from 'es-toolkit/compat';
import {forkJoin, Observable, of, Subject, Subscription} from 'rxjs';
import {NaturalAbstractPanel} from './abstract-panel';
import {getStackConfig} from './panels.urlmatcher';
import {
    NaturalPanelConfig,
    NaturalPanelData,
    NaturalPanelsBeforeOpenPanel,
    NaturalPanelsRouterRule,
    PanelsHooksConfig,
} from './types';

function segmentsToString(segments: UrlSegment[]): string {
    return segments.map(s => s.toString()).join('/');
}

function compareConfigs(a: NaturalPanelConfig, b: NaturalPanelConfig): boolean {
    return a.route.path === b.route.path && a.rule === b.rule && isEqual(a.params, b.params);
}

/**
 * TODO: implement route update when closing dialog with escape
 * @dynamic
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalPanelsService {
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);
    private readonly injector = inject(Injector);
    private hooksConfig = inject(PanelsHooksConfig);

    private readonly panelWidth = '960px';

    /**
     * Because of this static property Panels are **not** compatible with SSR.
     * And we cannot make it non-static, because `UrlMatcher` cannot be injected.
     */
    private static _opened = false;
    public static get opened(): boolean {
        return this._opened;
    }

    /**
     * Stream that emits when all open dialog have finished closing
     */
    public readonly afterAllClosed = new Subject<void>();
    /**
     * Cache for panels counter. Works more like an ID.
     * Is used to give an unique identifier to multiple similar panels configurations
     */
    private counter = 1;
    /**
     * Class applied to dialog overlay related with panels
     * If change, change CSS too
     */
    private panelClass = 'panel';

    /**
     * Cache for panels setup before navigation change.
     * Used to detect panels openings/closings and adapt for new configuration
     */
    private oldFullConfig: NaturalPanelConfig[] = [];

    /**
     * Cache for subscription stop
     */
    private routeSub?: Subscription;

    /**
     * Cache for subscription stop
     */
    private navSub?: Subscription;

    /**
     * Horizontal gaps between panels
     */
    private panelsOffsetH = 35;

    /**
     * Vertical gaps between panels
     */
    private panelsOffsetV = 40;

    /**
     * Cache of previous screen size
     * Used to change panels stack orientation on small screens
     */
    private isVertical = false;

    public constructor() {
        const breakpointObserver = inject(BreakpointObserver);

        //  Watch media to know if display panels horizontally or vertically
        breakpointObserver
            .observe(Breakpoints.XSmall)
            .pipe(takeUntilDestroyed())
            .subscribe(result => {
                this.isVertical = result.matches;
                this.updateComponentsPosition();
            });
    }

    /**
     * Notify the service to start listening to route changes to open panels
     *
     * @internal
     */
    public start(route: ActivatedRoute): void {
        NaturalPanelsService._opened = true;
        this.routeSub = route.url.subscribe(segments => {
            this.updatePanels(segments, route.snapshot.data.panelsRoutes);
        });

        this.navSub = this.router.events.subscribe(ev => {
            if (!(ev instanceof NavigationError)) {
                return;
            }

            // Abort and propagate navigation error
            if (ev.url.endsWith('/')) {
                this.stop();

                // This is a bit hackish: we hardcode an impossible url to trigger normal navigation error mechanism
                this.router.navigateByUrl('panels-reached-invalid-url');

                return;
            }

            this.counter++;

            // pc stands for "panel counter", required to give an identification to panels with exact same config
            // E.g /new
            const wantedUrl = ev.url + ';pc=' + this.counter;

            // Segments matching from wanted url. E.g ~ ['new']
            const wantedUrSegments = new DefaultUrlSerializer().parse(wantedUrl).root.children.primary.segments;

            // Don't match any config
            const wantedConfig = getStackConfig(wantedUrSegments, route.snapshot.data.panelsRoutes, this.injector);

            if (wantedConfig.length) {
                return this.appendConfigToCurrentUrl(wantedConfig);
            }

            // Currently activated routes. E.g ['objective', 'objective', 123, 'risk']
            const currentSegments = flatten(
                this.dialog.openDialogs.map(d => d.componentInstance.panelData.config.route.segments),
            );

            // Last segment. E.g ['risk']
            const lastOfCurrentSegments = currentSegments.slice(-1);

            // Config for ['risk', 'new']
            const currentAndWantedConfig = getStackConfig(
                lastOfCurrentSegments.concat(wantedUrSegments),
                route.snapshot.data.panelsRoutes,
                this.injector,
            );

            return this.appendConfigToCurrentUrl(currentAndWantedConfig);
        });
    }

    /**
     * Uses given configuration to add at the end of current url
     */
    private appendConfigToCurrentUrl(config: NaturalPanelConfig[]): void {
        // Navigate to the same url + /risk/new Result : /risk/risk/new
        const newUrl = config.map(conf => segmentsToString(conf.route.segments)).join('/');

        this.router.navigateByUrl(this.router.url + '/' + newUrl);
    }

    /**
     * Notify the service that all panels were closed
     *
     * @internal
     */
    public stop(): void {
        NaturalPanelsService._opened = false;
        this.routeSub?.unsubscribe();
        this.navSub?.unsubscribe();
        this.dialog.closeAll();
        this.oldFullConfig = [];
        this.afterAllClosed.next();
    }

    /**
     * Go to panel matching given component. Causes an url change.
     *
     * @internal
     */
    public goToPanelByComponent(component: NaturalAbstractPanel): void {
        this.goToPanelByIndex(this.getPanelIndex(component));
    }

    /**
     * Go to panel matching given component. Causes an url change.
     */
    public goToPenultimatePanel(): void {
        this.goToPanelByIndex(this.dialog.openDialogs.length - 2);
    }

    /**
     * Calls the new url that only includes the segments from the panels we want to stay open
     */
    private goToPanelByIndex(index: number): void {
        // Extracts url segments from next panel until last one
        const url = this.dialog.openDialogs
            .slice(index + 1)
            .map(dialog => {
                return segmentsToString(dialog.componentInstance.panelData.config.route.segments);
            })
            .join('/');

        // Remove extra segments and redirects to root
        this.router.navigateByUrl(this.router.url.replace('/' + url, ''));
    }

    /**
     * Selecting a panel is equivalent to close all those that are in front of him
     * @param index of panel in stack. The most behind (the first one) is 0.
     */
    private selectPanelByIndex(index: number): Observable<void> {
        const lastDialog = this.dialog.openDialogs[this.dialog.openDialogs.length - 1];

        // Update new panels set positions
        this.updateComponentsPosition();

        for (let i = this.dialog.openDialogs.length - 1; i >= index + 1; i--) {
            this.dialog.openDialogs[i].close();
        }

        return lastDialog.afterClosed();
    }

    /**
     * Open new panels if url has changed with new segments
     */
    private updatePanels(segments: UrlSegment[], routes: NaturalPanelsRouterRule[]): void {
        // Transform url segments into a config with component name and ID if provided in next segment
        // Returns an array of configs, each config represents the content relative to a panel
        const newFullConfig = getStackConfig(segments, routes, this.injector);
        const configsToRemove = differenceWith(this.oldFullConfig, newFullConfig, compareConfigs);
        const configsToAdd = differenceWith(newFullConfig, this.oldFullConfig, compareConfigs);

        const indexOfNextPanel = this.oldFullConfig.length - configsToRemove.length - 1;

        if (configsToRemove.length && configsToAdd.length) {
            // Add and remove panels
            this.selectPanelByIndex(indexOfNextPanel).subscribe(() => {
                this.openPanels(configsToAdd, newFullConfig).subscribe(() => this.updateComponentsPosition());
            });
        } else if (configsToRemove.length && !configsToAdd.length) {
            // only remove panels
            this.selectPanelByIndex(indexOfNextPanel).subscribe(() => this.updateComponentsPosition());
        } else if (!configsToRemove.length && configsToAdd.length) {
            // only add panels
            this.openPanels(configsToAdd, newFullConfig).subscribe(() => this.updateComponentsPosition());
        }

        this.oldFullConfig = newFullConfig;
    }

    /**
     * Resolve all services, then open panels
     */
    private openPanels(
        newItemsConfig: NaturalPanelConfig[],
        fullConfig: NaturalPanelConfig[],
    ): Observable<Observable<any> | null> {
        const subject = new Subject<Observable<any> | null>();

        // Resolve everything before opening a single panel
        const resolves = newItemsConfig.map(conf => this.getResolvedData(conf));

        // ForkJoin emits when all promises are executed;
        forkJoin(resolves).subscribe(resolvedResult => {
            // For each new config entry, open a new panel
            for (let i = 0; i < newItemsConfig.length; i++) {
                const config = newItemsConfig[i];
                let itemData: NaturalPanelData = {
                    // Config of actual panel route
                    config: config,

                    // Data resolved by service
                    // Use in component by calling this.panelData.data.xyz
                    data: resolvedResult[i],
                    linkableObjects: [],
                };

                if (this.hooksConfig?.beforeOpenPanel) {
                    const event: NaturalPanelsBeforeOpenPanel = {
                        itemData: itemData,
                        panelConfig: config,
                        resolvedResult: resolvedResult,
                        fullPanelsConfig: fullConfig,
                    };

                    itemData = this.hooksConfig.beforeOpenPanel(this.injector, event);
                }

                this.openPanel(config.component, itemData);
            }

            this.dialog.openDialogs[this.dialog.openDialogs.length - 1].afterOpened().subscribe(() => {
                subject.next(null);
            });
        });

        return subject;
    }

    private getResolvedData(config: NaturalPanelConfig): Observable<Record<string, unknown>> {
        if (!config.resolve || (config.resolve && Object.keys(config.resolve).length === 0)) {
            return of({});
        }

        const resolveKeys = Object.keys(config.resolve);
        const resolvedData: Record<string, Observable<unknown>> = {};
        const injector = config.injector;

        if (injector) {
            resolveKeys.forEach(key => {
                resolvedData[key] = runInInjectionContext(injector, () => config.resolve[key](config));
            });
        }

        return forkJoin(resolvedData);
    }

    private openPanel(componentOrTemplateRef: ComponentType<NaturalAbstractPanel>, data: NaturalPanelData): void {
        const conf: MatDialogConfig = {
            panelClass: this.panelClass,
            closeOnNavigation: false,
            hasBackdrop: this.dialog.openDialogs.length === 0,
            height: '100%',
            width: this.panelWidth,
            position: {
                top: '0',
                right: '0',
            },
        };

        const dialogRef = this.dialog.open<NaturalAbstractPanel>(componentOrTemplateRef, conf);

        // Panelisable interface attributes/functions
        dialogRef.componentInstance.initPanel(data);

        dialogRef.beforeClosed().subscribe(() => {
            const index = this.getPanelIndex(dialogRef.componentInstance);
            this.goToPanelByIndex(index - 1);
        });
    }

    /**
     * Return panel position (index) by searching matching component
     */
    private getPanelIndex(component: NaturalAbstractPanel): number {
        if (!component) {
            return -1;
        }

        return this.dialog.openDialogs.findIndex(dialog => dialog.componentInstance === component);
    }

    /**
     * Whether the given panel is currently the top, visible, panel. If there are no panels opened at all, then any panel given is considered top, visible, panel.
     */
    public isTopPanel(component: NaturalAbstractPanel): boolean {
        const length = this.dialog.openDialogs.length;
        return !length || this.dialog.openDialogs[length - 1]?.componentInstance === component;
    }

    /**
     * Repositions panels from start until given index
     */
    private updateComponentsPosition(): void {
        if (!this.dialog.openDialogs.length) {
            return;
        }

        // Select the panels that are still opened, ignore the others because they'll be closed
        const affectedElements = this.dialog.openDialogs;
        for (let i = 0; i < affectedElements.length; i++) {
            const dialog = affectedElements[i];

            // Set all panels as "hidden" except last one. IsFrontPanel attribute causes a CSS that hides body via hostbinding
            dialog.componentInstance.isFrontPanel = i === affectedElements.length - 1;
            dialog.componentInstance.panelService = this;

            // Assign offset
            const deep = affectedElements.length - 1 - i;

            let position: any = {right: deep * this.panelsOffsetH + 'px'};
            if (this.isVertical && affectedElements.length > 1) {
                const top = i * this.panelsOffsetV + 'px';
                position = {top: top, right: '0px'};
                dialog.updateSize(this.panelWidth, `calc(100% - ${top})`); // call before updatePosition
            } else {
                dialog.updateSize(this.panelWidth, `100%`);
            }

            dialog.updatePosition(position);
        }
    }
}
