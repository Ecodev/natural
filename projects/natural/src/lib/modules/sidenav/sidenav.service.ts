import {DestroyRef, inject, Injectable} from '@angular/core';
import {MatDrawerMode} from '@angular/material/sidenav';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';
import {SESSION_STORAGE} from '../common/services/memory-storage';
import {NaturalSidenavStackService} from './sidenav-stack.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Assert that given value is not null
 */
function assert(value: unknown): asserts value {
    if (!value) {
        throw new Error('Must call NaturalSidenavService.init() before using the service');
    }
}

/**
 * TODO: Fix nav minimize and maximize resize
 * Since Material 2 beta 10, when nav is resized the body is not resized
 * https://github.com/angular/material2/issues/6743
 * Maybe the better is to wait next release
 */
@Injectable({providedIn: 'root'})
export class NaturalSidenavService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly breakpointObserver = inject(BreakpointObserver);
    private readonly router = inject(Router);
    private readonly sessionStorage = inject(SESSION_STORAGE);
    private readonly naturalSidenavStackService = inject(NaturalSidenavStackService);

    /**
     * Navigation modes
     * First is for desktop view
     * Second is for mobile view
     */
    private modes: MatDrawerMode[] = ['side', 'push'];

    /**
     * Activated mode
     * Default to desktop view
     */
    private mode: MatDrawerMode = this.modes[0];

    /**
     * Whether nav is opened or not
     */
    private opened = true;

    /**
     * Stores the opened status during mobile view, to restore if we come back to desktop view
     */
    private tmpOpened: boolean = this.opened;

    /**
     * Whether nav is minimized or not
     */
    private minimized = false;

    /**
     * LocalStorage key that stores the minimized status
     */
    private readonly minimizedStorageKey = 'menu-minimized';

    /**
     * LocalStorage key that stores the opened status
     */
    private readonly openedStorageKey = 'menu-opened';

    private minimizedStorageKeyWithName: string | null = null;
    private openedStorageKeyWithName: string | null = null;
    private _isMobileView = false;

    public get activeMode(): MatDrawerMode {
        return this.mode;
    }

    public get isOpened(): boolean {
        return this.opened;
    }

    public get isMinimized(): boolean {
        return this.minimized;
    }

    public destroy(component: NaturalSidenavContainerComponent): void {
        this.naturalSidenavStackService.unregister(component);
    }

    public init(name: string, component: NaturalSidenavContainerComponent, autoClose = false): void {
        if (!name || name === '') {
            throw new Error('No sidenav name provided, use <natural-sidenav-container name="menu">');
        }

        this.naturalSidenavStackService.register(component);

        this.minimizedStorageKeyWithName = name + '-' + this.minimizedStorageKey;
        this.openedStorageKeyWithName = name + '-' + this.openedStorageKey;

        // Init from LocalStorage
        this.minimized = this.getMinimizedStatus();
        this.opened = this.getMenuOpenedStatus();
        this.tmpOpened = this.opened;

        let oldIsBig: boolean | null = null;

        this.breakpointObserver
            .observe([Breakpoints.XSmall, Breakpoints.Small])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(r => {
                this._isMobileView = r.matches;
                const isBig = !this._isMobileView;
                this.mode = isBig ? this.modes[0] : this.modes[1];

                if (oldIsBig === null || isBig !== oldIsBig) {
                    oldIsBig = isBig;

                    // If decrease window size, save status of menu before closing it
                    if (!isBig) {
                        this.tmpOpened = this.opened;
                        this.opened = false;
                    }

                    // If increase window size, and sidebar was open before, re-open it.
                    if (isBig && this.tmpOpened) {
                        this.opened = true;
                        this.minimized = this.getMinimizedStatus();
                    }
                }
            });

        if (autoClose) {
            this.router.events
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    filter(e => e instanceof NavigationEnd),
                )
                .subscribe(() => {
                    this.navItemClicked();
                });
        }
    }

    public isMobileView(): boolean {
        return this._isMobileView;
    }

    /**
     * Close nav on mobile view after a click
     */
    public navItemClicked(): void {
        if (this._isMobileView) {
            this.close();
        }
    }

    /**
     * Change minimized status and stores the new value
     */
    public setMinimized(value: boolean): void {
        this.minimized = value;
        assert(this.minimizedStorageKeyWithName);
        this.sessionStorage.setItem(this.minimizedStorageKeyWithName, value ? 'true' : 'false');
    }

    public minimize(): void {
        this.setMinimized(true);
    }

    public expand(): void {
        this.setMinimized(false);
    }

    public toggleMinimized(): void {
        this.setMinimized(!this.minimized);
    }

    /**
     * Get the stored minimized status
     */
    public getMinimizedStatus(): boolean {
        assert(this.minimizedStorageKeyWithName);
        const value = this.sessionStorage.getItem(this.minimizedStorageKeyWithName);

        return value === null ? false : value === 'true';
    }

    /**
     * Get the stored opened status
     * Default on an opened status if nothing is stored
     */
    public getMenuOpenedStatus(): boolean {
        assert(this.openedStorageKeyWithName);
        const value = this.sessionStorage.getItem(this.openedStorageKeyWithName);

        if (value === null) {
            return !this._isMobileView;
        } else {
            return value === 'true';
        }
    }

    /**
     * Toggle menu but expand it if mobile mode is activated
     * Stores the status in local storage
     */
    public toggle(): void {
        this.setOpened(!this.opened);
    }

    public close(): void {
        this.setOpened(false);
    }

    public open(): void {
        this.setOpened(true);
    }

    public setOpened(value: boolean): void {
        this.opened = value;

        if (this.opened && this._isMobileView) {
            this.minimized = false;
        } else if (!this._isMobileView) {
            assert(this.openedStorageKeyWithName);
            this.sessionStorage.setItem(this.openedStorageKeyWithName, this.opened ? 'true' : 'false');
        }
    }
}
