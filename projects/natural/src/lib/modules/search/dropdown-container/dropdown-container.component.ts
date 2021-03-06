import {AnimationEvent} from '@angular/animations';
import {ConfigurableFocusTrapFactory, FocusTrap} from '@angular/cdk/a11y';
import {BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    Inject,
    InjectionToken,
    OnDestroy,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {Subject} from 'rxjs';
import {DropdownResult} from '../types/values';
import {naturalDropdownAnimations} from './dropdown-container-animations';

export function throwMatDialogContentAlreadyAttachedError(): void {
    throw Error('Attempting to attach dialog content after content is already attached');
}

export interface NaturalDropdownContainerData {
    showValidateButton: boolean;
}

export const NATURAL_DROPDOWN_CONTAINER_DATA = new InjectionToken<NaturalDropdownContainerData>(
    'NaturalDropdownContainerData',
);

@Component({
    templateUrl: './dropdown-container.component.html',
    styleUrls: ['./dropdown-container.component.scss'],
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    animations: [naturalDropdownAnimations.transformMenu, naturalDropdownAnimations.fadeInItems],
})
export class NaturalDropdownContainerComponent extends BasePortalOutlet implements OnDestroy {
    @ViewChild(CdkPortalOutlet, {static: true}) public portalOutlet!: CdkPortalOutlet;
    @ViewChild(TemplateRef, {static: true}) public templateRef!: TemplateRef<any>;

    public readonly closed = new Subject<DropdownResult>();

    /** Current state of the panel animation. */
    public panelAnimationState: 'void' | 'enter' = 'void';

    /** Emits whenever an animation on the menu completes. */
    private animationDone = new Subject<void>();

    private focusTrap: FocusTrap | null = null;
    private elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    constructor(
        private readonly elementRef: ElementRef,
        private readonly focusTrapFactory: ConfigurableFocusTrapFactory,
        @Inject(NATURAL_DROPDOWN_CONTAINER_DATA) public data: NaturalDropdownContainerData,
    ) {
        super();
    }

    public ngOnDestroy(): void {
        this.closed.complete();
    }

    public close(): void {
        this.closed.next();
    }

    public attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        return this.portalOutlet.attachTemplatePortal(portal);
    }

    public attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        if (this.portalOutlet.hasAttached()) {
            throwMatDialogContentAlreadyAttachedError();
        }

        return this.portalOutlet.attachComponentPortal(portal);
    }

    public startAnimation(): void {
        this.panelAnimationState = 'enter';
    }

    public onAnimationDone(event: AnimationEvent): void {
        if (event.toState === 'enter') {
            this.trapFocus();
        } else if (event.toState === 'exit') {
            this.restoreFocus();
        }

        this.animationDone.next();
    }

    private trapFocus(): void {
        if (!this.focusTrap) {
            this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
        }

        this.focusTrap.focusInitialElementWhenReady();
    }

    /** Restores focus to the element that was focused before the dialog opened. */
    private restoreFocus(): void {
        const toFocus = this.elementFocusedBeforeDialogWasOpened;

        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            toFocus.focus();
        }

        if (this.focusTrap) {
            this.focusTrap.destroy();
        }
    }
}
