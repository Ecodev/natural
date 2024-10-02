import {Directive, inject, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {kebabCase} from 'lodash-es';
import {NaturalAlertService} from '../modules/alert/alert.service';
import {NaturalAbstractPanel} from '../modules/panels/abstract-panel';
import {NaturalAbstractModelService, WithId} from '../services/abstract-model.service';
import {ExtractResolve, ExtractTcreate, ExtractTone, ExtractTupdate, Literal} from '../types/types';
import {EMPTY, endWith, finalize, last, Observable, switchMap, tap} from 'rxjs';
import {ifValid, validateAllFormControls} from './validators';
import {PaginatedData} from './data-source';
import {QueryVariables} from './query-variable-manager';
import {CumulativeChanges} from './cumulative-changes';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NaturalDialogTriggerProvidedData} from '../modules/dialog-trigger/dialog-trigger.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * `Data` contains in `model` either the model fetched from DB or default values (without ID). And besides `model`,
 * any other extra keys defined by Extra.
 */
type Data<TService, Extra> = {model: {id?: string} & ExtractResolve<TService>} & Extra;

function isNaturalDialogTriggerProvidedData(
    dialogData: unknown,
): dialogData is NaturalDialogTriggerProvidedData<never> {
    return (
        !!dialogData &&
        typeof dialogData === 'object' &&
        'activatedRoute' in dialogData &&
        dialogData.activatedRoute instanceof ActivatedRoute
    );
}

// @dynamic
@Directive({standalone: true})
export class NaturalAbstractDetail<
        TService extends NaturalAbstractModelService<
            {id: string},
            any,
            PaginatedData<Literal>,
            QueryVariables,
            any,
            any,
            any,
            any,
            unknown,
            any
        >,
        ExtraResolve extends Literal = Record<never, never>,
    >
    extends NaturalAbstractPanel
    implements OnInit
{
    /**
     * Data retrieved by the server via route resolvers.
     *
     * The key `model` is special. It is readonly and represents the model being updated
     * as it exists on server. The value is kept up to date when Apollo mutates it on server.
     *
     * The only time when `model` is not readonly is during creation. Only then can we modify the model values directly.
     *
     * Other keys, if present, are whatever is returned from route resolvers as-is.
     */
    public override data: Data<TService, ExtraResolve> = {
        model: this.service.getDefaultForServer(),
    } as Data<TService, ExtraResolve>;

    /**
     * Form that manages the data from the controller
     */
    public form: UntypedFormGroup = new UntypedFormGroup({});

    /**
     * Show / hides the bottom fab button (mostly to hide it when we are on other tabs where semantic of button can conflict with ...
     * semantic of data on other tab, like relations that list other objects)
     */
    public showFabButton = true;

    protected readonly alertService = inject(NaturalAlertService);

    protected readonly router = inject(Router);

    protected readonly route = inject(ActivatedRoute);

    private readonly _dialogData: unknown = inject(MAT_DIALOG_DATA, {optional: true});

    /**
     * Once set, this must not change anymore, especially not right after the creation mutation,
     * so the form does not switch from creation mode to update mode without an actual reload of
     * model from DB (by navigating to update page).
     */
    private _isUpdatePage = false;
    private readonly changes = new CumulativeChanges<typeof this.form.getRawValue>();

    public constructor(
        protected readonly key: string,
        public readonly service: TService,
    ) {
        super();
    }

    /**
     * You probably should not override this method. Instead, consider overriding `initForm()`.
     */
    public ngOnInit(): void {
        if (this.isPanel) {
            this.initForm();
        } else {
            const route = isNaturalDialogTriggerProvidedData(this._dialogData)
                ? this._dialogData.activatedRoute
                : this.route;
            this.#subscribeToModelFromResolvedData(route);
        }
    }

    public changeTab(index: number): void {
        this.showFabButton = index === 0;
    }

    #subscribeToModelFromResolvedData(route: ActivatedRoute): void {
        let previousId = -1;
        route.data
            .pipe(
                switchMap(data => {
                    if (!(data.model instanceof Observable)) {
                        throw new Error(
                            'Resolved data must include the key `model`, and it must be an observable (usually one from Apollo).',
                        );
                    }

                    // Subscribe to model to know when Apollo cache is changed, so we can reflect it into `data.model`
                    return data.model.pipe(
                        tap((model: ExtractResolve<TService>) => {
                            this.data = {
                                ...data,
                                model: model,
                            } as Data<TService, ExtraResolve>;

                            if (previousId !== model.id) {
                                previousId = model.id;
                                this.initForm();
                            }
                        }),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    /**
     * Returns whether `data.model` was fetched from DB, so we are on an update page, or if it is a new object
     * with (only) default values, so we are on a creation page.
     *
     * This should be used instead of checking `data.model.id` directly, in order to type guard and get proper typing
     */
    protected isUpdatePage(): this is {data: {model: ExtractTone<TService>}} {
        return this._isUpdatePage;
    }

    /**
     * Update the object on the server with the values from the form fields that were modified since
     * the initialization, or since the previous successful update.
     *
     * Form fields that are never modified are **not** sent to the server, unless if you specify `submitAllFields`.
     */
    public update(now = false, submitAllFields = false): void {
        if (!this.isUpdatePage()) {
            return;
        }

        validateAllFormControls(this.form);

        ifValid(this.form).subscribe(() => {
            const newValues = this.form.getRawValue();
            if (submitAllFields) {
                this.changes.initialize({});
            }

            const toSubmit = {
                id: this.data.model.id,
                ...this.changes.differences(newValues),
            };

            const update = now ? this.service.updateNow(toSubmit) : this.service.update(toSubmit);
            update.subscribe(model => {
                this.changes.commit(newValues);
                this.alertService.info($localize`Mis à jour`);
                this.postUpdate(model);
            });
        });
    }

    public create(redirect = true): void {
        validateAllFormControls(this.form);

        if (!this.form.valid) {
            return;
        }

        const newValues = this.form.getRawValue();
        this.form.disable();

        this.service
            .create(newValues)
            .pipe(
                switchMap(model => {
                    this.alertService.info($localize`Créé`);

                    return this.postCreate(model).pipe(endWith(model), last());
                }),
                switchMap((model: WithId<object>) => {
                    if (redirect) {
                        if (this.isPanel) {
                            const oldUrl = this.router.url;
                            const nextUrl: string = this.panelData?.config.params.nextRoute;
                            const newUrl = oldUrl.replace('/new', '/' + model.id) + (nextUrl ? '/' + nextUrl : '');
                            return this.router.navigateByUrl(newUrl); // replace /new by /123
                        } else {
                            return this.router.navigate(['..', model.id], {relativeTo: this.route});
                        }
                    }

                    return EMPTY;
                }),
                finalize(() => this.form.enable()),
            )
            .subscribe();
    }

    /**
     * `confirmer` can be used to open a custom dialog, or anything else, to confirm the deletion, instead of the standard dialog
     */
    public delete(redirectionRoute?: unknown[], confirmer?: Observable<boolean | undefined>): void {
        this.form.disable();

        (
            confirmer ??
            this.alertService.confirm(
                $localize`Suppression`,
                $localize`Voulez-vous supprimer définitivement cet élément ?`,
                $localize`Supprimer définitivement`,
            )
        )
            .pipe(
                switchMap(confirmed => {
                    if (!confirmed || !this.isUpdatePage()) {
                        return EMPTY;
                    }

                    this.preDelete(this.data.model);

                    return this.service.delete([this.data.model]).pipe(
                        switchMap(() => {
                            this.alertService.info($localize`Supprimé`);

                            if (this.isPanel) {
                                this.panelService?.goToPenultimatePanel();

                                return EMPTY;
                            } else {
                                const defaultRoute = ['../../' + kebabCase(this.key)];
                                return this.router.navigate(redirectionRoute ? redirectionRoute : defaultRoute, {
                                    relativeTo: this.route,
                                });
                            }
                        }),
                    );
                }),
                finalize(() => this.form.enable()),
            )
            .subscribe();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postUpdate(model: ExtractTupdate<TService>): void {
        // noop
    }

    /**
     * Returns an observable that will be subscribed to immediately and the
     * redirect navigation will only happen after the observable completes.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected postCreate(model: ExtractTcreate<TService>): Observable<unknown> {
        return EMPTY;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected preDelete(model: ExtractTone<TService>): void {
        // noop
    }

    /**
     * Initialize the form whenever it is needed.
     *
     * You should override this method, and not `ngOnInit()` if you need to customize the form. Because this will
     * correctly be called more than one time per component instance if needed, when the route changes. But `ngOnInit()`
     * will incorrectly be called exactly 1 time per component instance, even if the object changes via route navigation.
     */
    protected initForm(): void {
        this._isUpdatePage = !!this.data.model.id;
        this.form = this.service.getFormGroup(this.data.model);
        this.changes.initialize(this.form.getRawValue());
    }
}
