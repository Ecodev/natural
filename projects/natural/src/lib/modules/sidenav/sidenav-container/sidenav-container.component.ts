import {Component, HostBinding, inject, Input, input, OnDestroy, OnInit, viewChild} from '@angular/core';
import {MatDrawer, MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {NaturalSidenavService} from '../sidenav.service';

@Component({
    selector: 'natural-sidenav-container',
    imports: [MatSidenav, MatSidenavContainer, MatSidenavContent],
    templateUrl: './sidenav-container.component.html',
    styleUrl: './sidenav-container.component.scss',
    providers: [NaturalSidenavService],
})
export class NaturalSidenavContainerComponent implements OnInit, OnDestroy {
    public readonly sidenavService = inject(NaturalSidenavService);

    /**
     * Unique identifier used for the local storage
     */
    public readonly name = input.required<string>();

    /**
     * The side that the drawer is attached to
     */
    public readonly position = input<MatDrawer['position']>('start');

    /**
     * If true listens to route changes to close side nav after a route change if mobile view is active
     * Actually a navigation to current route does not emit a route change, and the sidenav don't close.
     */
    public readonly mobileAutoClose = input(true);

    /**
     * Width of the minimized menu
     */
    public readonly minimizedWidth = input(150);

    /**
     * If true, prevents "native" material sidenav to scroll at container level and delegates the scroll responsability to the transcluded
     * content
     */
    @HostBinding('attr.no-scroll') @Input() public noScroll = false;

    /**
     * Inner "native" material sidenav
     */
    public readonly menuSidenav = viewChild.required(MatSidenav);

    public get isMinimized(): boolean {
        return this.sidenavService.isMinimized;
    }

    public get isMobileView(): boolean {
        return this.sidenavService.isMobileView();
    }

    public ngOnInit(): void {
        this.sidenavService.init(this);
    }

    public ngOnDestroy(): void {
        this.sidenavService.destroy(this);
    }

    public toggle(): void {
        this.sidenavService.toggle();
    }

    public close(): void {
        this.sidenavService.close();
    }

    public open(): void {
        this.sidenavService.open();
    }

    public minimize(): void {
        this.sidenavService.minimize();
    }

    public expand(): void {
        this.sidenavService.expand();
    }

    public toggleMinimized(): void {
        this.sidenavService.toggleMinimized();
    }
}
