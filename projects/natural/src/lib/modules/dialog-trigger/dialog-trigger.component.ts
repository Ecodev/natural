import {type ComponentType} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, Component, inject, type OnDestroy} from '@angular/core';
import {MatDialog, type MatDialogConfig, type MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';

type NavigateCommands = Parameters<Router['navigate']>[0];

export type NaturalDialogTriggerRoutingData<T, D> = {
    component: ComponentType<T>;
    afterClosedRoute?: NavigateCommands;
    dialogConfig: MatDialogConfig<D>;
};

export type NaturalDialogTriggerProvidedData<D> = {
    data?: Readonly<D> | null;
    activatedRoute: ActivatedRoute;
};

export type NaturalDialogTriggerRedirectionValues = NavigateCommands | null | undefined | '' | -1;

@Component({
    imports: [RouterOutlet],
    template: '<router-outlet/>',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class NaturalDialogTriggerComponent<T, D> implements OnDestroy {
    private readonly dialog = inject(MatDialog);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    private readonly dialogRef: MatDialogRef<T, NaturalDialogTriggerRedirectionValues>;

    private readonly triggerConfig: NaturalDialogTriggerRoutingData<T, D>;

    public constructor() {
        // Data from activated route
        this.triggerConfig = this.route.snapshot.data.trigger as NaturalDialogTriggerRoutingData<T, D>;

        // Get data relative to dialog service configuration
        const {data, ...config} = this.triggerConfig.dialogConfig;
        const dialogConfig: MatDialogConfig<NaturalDialogTriggerProvidedData<D>> = {
            ...config,
            data: {
                data: data,
                // Set data accessible into component instantiated by the dialog service
                activatedRoute: this.route,
            },
        };

        this.dialogRef = this.dialog.open<
            T,
            NaturalDialogTriggerProvidedData<D>,
            NaturalDialogTriggerRedirectionValues
        >(this.triggerConfig.component, dialogConfig);

        // Redirect on closing (if applicable)
        this.dialogRef.beforeClosed().subscribe(exitValue => this.redirect(exitValue));
    }

    /**
     * Called when router leaves route, and so on, closes the modal with undefined value to prevent a new redirection
     */
    public ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close(-1); // -1 = no redirection
        }
    }

    /**
     * Redirects on modal closing under following rules/conditions
     *
     * If -1 : no redirection
     * If array: assumed to be navigation commands and navigate to that
     * If routing data provides navigation commands, navigate to that
     * Anything else: fallbacks on parent route
     *
     * CAUTION: `exitValue` is typed, but we can actually receive anything, because of non-typed template usages such as `[mat-dialog-close]="true"`
     */
    public redirect(exitValue: NaturalDialogTriggerRedirectionValues): void {
        if (exitValue === -1) {
            // if -1, don't redirect
            return;
        } else if (Array.isArray(exitValue)) {
            // If exit value is navigation commands, redirect to that
            this.router.navigate(exitValue);
        } else if (this.triggerConfig.afterClosedRoute) {
            // If navigation commands specified in route data, use them
            this.router.navigate(this.triggerConfig.afterClosedRoute);
        } else {
            // Anything else: go to parent (caution: parent can't have empty path : ''),
            this.router.navigate(['.'], {relativeTo: this.route.parent});
        }
    }
}
