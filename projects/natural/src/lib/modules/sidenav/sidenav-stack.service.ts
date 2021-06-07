import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';

@Injectable({providedIn: 'root'})
export class NaturalSidenavStackService {
    /**
     * The stack of all currently living sidenavs
     */
    private readonly sidenavs: NaturalSidenavContainerComponent[] = [];

    /**
     * Emits the most recent living SidenavContainer whenever it changes. So it's
     * either the SidenavContainer that was just added, or the one "before" the
     * SidenavContainer that was just removed
     */
    public readonly currentSidenav = new Subject<NaturalSidenavContainerComponent | undefined>();

    /**
     * For internal use only
     * @internal
     */
    public register(sidenav: NaturalSidenavContainerComponent): void {}

    /**
     * For internal use only
     * @internal
     */
    public unregister(sidenav: NaturalSidenavContainerComponent): void {}

    private next(): void {}
}
