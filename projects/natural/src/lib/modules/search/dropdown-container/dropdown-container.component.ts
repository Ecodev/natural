import {ConfigurableFocusTrapFactory, FocusTrap} from '@angular/cdk/a11y';
import {BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    inject,
    InjectionToken,
    OnDestroy,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';
import {Subject} from 'rxjs';
import {MatButton} from '@angular/material/button';

export function throwMatDialogContentAlreadyAttachedError(): void {
    throw Error('Attempting to attach dialog content after content is already attached');
}

export type NaturalDropdownContainerData = {
    showValidateButton: boolean;
};

export const NATURAL_DROPDOWN_CONTAINER_DATA = new InjectionToken<NaturalDropdownContainerData>(
    'NaturalDropdownContainerData',
);

/** Name of the enter animation `@keyframes`. */
const ENTER_ANIMATION = '_mat-menu-enter';

/** Name of the exit animation `@keyframes`. */
const EXIT_ANIMATION = '_mat-menu-exit';

@Component({
    imports: [CdkPortalOutlet, MatButton],
    templateUrl: './dropdown-container.component.html',
    styleUrl: './dropdown-container.component.scss',
    // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
    encapsulation: ViewEncapsulation.None,
})
export class NaturalDropdownContainerComponent extends BasePortalOutlet implements OnDestroy {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
    public readonly data = inject(NATURAL_DROPDOWN_CONTAINER_DATA);

    public readonly portalOutlet = viewChild.required(CdkPortalOutlet);

    public readonly closed = new Subject<void>();

    /** Current state of the panel animation. */
    protected panelAnimationState: 'void' | 'enter' = 'enter';

    private focusTrap: FocusTrap | null = null;
    private elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    public ngOnDestroy(): void {
        this.closed.complete();
    }

    public close(): void {
        this.panelAnimationState = 'void';
    }

    public attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        return this.portalOutlet().attachTemplatePortal(portal);
    }

    public attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        const portalOutlet = this.portalOutlet();
        if (portalOutlet.hasAttached()) {
            throwMatDialogContentAlreadyAttachedError();
        }

        return portalOutlet.attachComponentPortal(portal);
    }

    /** Callback that is invoked when the panel animation completes. */
    protected onAnimationDone(state: string): void {
        const isExit = state === EXIT_ANIMATION;

        if (isExit || state === ENTER_ANIMATION) {
            if (isExit) {
                this.restoreFocus();
                this.closed.next();
            } else {
                this.trapFocus();
            }
        }
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
