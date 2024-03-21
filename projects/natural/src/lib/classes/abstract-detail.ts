import {Directive, inject, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {kebabCase} from 'lodash-es';
import {NaturalAlertService} from '../modules/alert/alert.service';
import {NaturalAbstractPanel} from '../modules/panels/abstract-panel';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {ExtractResolve, ExtractTcreate, ExtractTone, ExtractTupdate, Literal} from '../types/types';
import {EMPTY, endWith, finalize, last, Observable, Subscription, switchMap, takeUntil} from 'rxjs';
import {ifValid, validateAllFormControls} from './validators';
import {PaginatedData} from './data-source';
import {QueryVariables} from './query-variable-manager';
import {CumulativeChanges} from './cumulative-changes';

/**
 * `Data` contains in `model` either the model fetched from DB or default values (without ID). And besides `model`,
 * any other extra keys defined by Extra.
 */
type Data<TService, Extra> = {model: {id?: string} & ExtractResolve<TService>} & Extra;

// @dynamic
@Directive()
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
     * Empty placeholder for data retrieved by the server
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

    /**
     * Injected service
     */
    protected readonly alertService = inject(NaturalAlertService);

    /**
     * Injected service
     */
    protected readonly router = inject(Router);

    /**
     * Injected service
     */
    protected readonly route = inject(ActivatedRoute);

    /**
     * Once set, this must not change anymore, especially not right after the creation mutation,
     * so the form does not switch from creation mode to update mode without an actual reload of
     * model from DB (by navigating to update page).
     */
    #isUpdatePage = false;
    #modelSub: Subscription | null = null;
    readonly #changes = new CumulativeChanges<typeof this.form.getRawValue>();

    public constructor(
        protected readonly key: string,
        public readonly service: TService,
    ) {
        super();
    }

    public ngOnInit(): void {
        if (!this.isPanel) {
            this.route.data.subscribe(incomingData => {
                if (!(incomingData.model instanceof Observable)) {
                    throw new Error(
                        'Resolved data must include the key `model`, and it must be an observable (usually one from Apollo).',
                    );
                }

                // Subscribe to model to know when Apollo cache is changed, so we can reflect it into `data.model`
                this.#modelSub?.unsubscribe();
                this.#modelSub = incomingData.model
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe((model: ExtractResolve<TService>) => {
                        this.data = {
                            ...incomingData,
                            model: model,
                        } as Data<TService, ExtraResolve>;
                    });
                this.initForm();
            });
        } else {
            this.initForm();
        }
    }

    public changeTab(index: number): void {
        this.showFabButton = index === 0;
    }

    /**
     * Returns whether `data.model` was fetched from DB, so we are on an update page, or if it is a new object
     * with (only) default values, so we are on a creation page.
     *
     * This should be used instead of checking `data.model.id` directly, in order to type guard and get proper typing
     */
    protected isUpdatePage(): this is {data: {model: ExtractTone<TService>}} {
        return this.#isUpdatePage;
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
                this.#changes.initialize({});
            }

            const toSubmit = {
                id: this.data.model.id,
                ...this.#changes.differences(newValues),
            };

            const update = now ? this.service.updateNow(toSubmit) : this.service.update(toSubmit);
            update.subscribe(model => {
                this.#changes.commit(newValues);
                this.alertService.info($localize`Mis à jour`);
                this.form.patchValue(model);
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
                    this.form.patchValue(model);

                    return this.postCreate(model).pipe(endWith(model), last());
                }),
                switchMap(model => {
                    if (redirect) {
                        if (this.isPanel) {
                            const oldUrl = this.router.url;
                            const nextUrl = this.panelData?.config.params.nextRoute;
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

    protected initForm(): void {
        this.#isUpdatePage = !!this.data.model.id;
        this.form = this.service.getFormGroup(this.data.model);
        this.#changes.initialize(this.form.getRawValue());
    }
}
