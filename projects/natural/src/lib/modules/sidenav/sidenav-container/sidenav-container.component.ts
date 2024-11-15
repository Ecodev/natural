import {Component, HostBinding, inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDrawer, MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {NaturalSidenavService} from '../sidenav.service';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'natural-sidenav-container',
    templateUrl: './sidenav-container.component.html',
    styleUrl: './sidenav-container.component.scss',
    providers: [NaturalSidenavService],
    standalone: true,
    imports: [MatSidenavModule, CommonModule],
})
export class NaturalSidenavContainerComponent implements OnInit, OnDestroy {
    public readonly sidenavService = inject(NaturalSidenavService);

    /**
     * Unique identifier used for the local storage
     */
    @Input({required: true}) public name!: string;

    /**
     * The side that the drawer is attached to
     */
    @Input() public position: MatDrawer['position'] = 'start';

    /**
     * If true listens to route changes to close side nav after a route change if mobile view is active
     * Actually a navigation to current route does not emit a route change, and the sidenav don't close.
     */
    @Input() public mobileAutoClose = true;

    /**
     * Width of the minimized menu
     */
    @Input() public minimizedWidth = 150;

    /**
     * If true, prevents "native" material sidenav to scroll at container level and delegates the scroll responsability to the transcluded
     * content
     */
    @HostBinding('attr.no-scroll') @Input() public noScroll = false;

    /**
     * Inner "native" material sidenav
     */
    @ViewChild(MatSidenav, {static: true}) public menuSidenav!: MatSidenav;

    public get isMinimized(): boolean {
        return this.sidenavService.isMinimized;
    }

    public get isMobileView(): boolean {
        return this.sidenavService.isMobileView();
    }

    public ngOnInit(): void {
        this.sidenavService.init(this.name, this, this.mobileAutoClose);
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
