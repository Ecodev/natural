import {Apollo, gql, onlyCompleteData} from 'apollo-angular';
import {
    type ApolloLink,
    NetworkStatus,
    type ObservableQuery,
    type OperationVariables,
    type WatchQueryFetchPolicy,
} from '@apollo/client';
import {
    type AbstractControl,
    type AsyncValidatorFn,
    UntypedFormControl,
    UntypedFormGroup,
    type ValidatorFn,
} from '@angular/forms';
import {type DocumentNode} from 'graphql';
import {merge, pick} from 'es-toolkit';
import {defaults} from 'es-toolkit/compat';
import {catchError, combineLatest, EMPTY, first, Observable, of, type OperatorFunction} from 'rxjs';
import {debounceTime, filter, map, shareReplay, startWith, switchMap, takeWhile, tap} from 'rxjs/operators';
import {NaturalQueryVariablesManager, type QueryVariables} from '../classes/query-variable-manager';
import {type Literal} from '../types/types';
import {makePlural, relationsToIds, upperCaseFirstLetter} from '../classes/utility';
import {type PaginatedData} from '../classes/data-source';
import {NaturalDebounceService} from './debounce.service';
import {deepClone} from '../modules/search/classes/utils';
import {inject} from '@angular/core';

export type FormValidators = Record<string, ValidatorFn[]>;

export type FormAsyncValidators = Record<string, AsyncValidatorFn[]>;

export type VariablesWithInput = {
    input: Literal;
};

export type FormControls = Record<string, AbstractControl>;

export type WithId<T> = {id: string} & T;

export type MutateOptionsWithoutVariables<Tcreate, Vcreate extends OperationVariables> = Omit<
    Apollo.MutateOptions<Tcreate, Vcreate>,
    'mutation' | 'variables'
>;

export type WatchQueryOptionsWithoutVariables<Tcreate, Vcreate extends OperationVariables> = Omit<
    Apollo.WatchQueryOptions<Tcreate, Vcreate>,
    'query' | 'variables' | 'notifyOnNetworkStatusChange'
>;

export abstract class NaturalAbstractModelService<
    Tone,
    Vone extends {id: string},
    Tall extends PaginatedData<Literal>,
    Vall extends QueryVariables,
    Tcreate,
    Vcreate extends VariablesWithInput,
    Tupdate,
    Vupdate extends {id: string; input: Literal},
    Tdelete,
    Vdelete extends {ids: string[]},
> {
    /**
     * Store the creation mutations that are pending
     */
    private readonly creatingCache = new Map<Vcreate['input'] | WithId<Vupdate['input']>, Observable<Tcreate>>();
    protected readonly apollo = inject(Apollo);
    protected readonly naturalDebounceService = inject(NaturalDebounceService);
    private readonly plural: string;

    /**
     *
     * @param name service and single object query name (eg. userForFront or user).
     * @param oneQuery GraphQL query to fetch a single object from ID (eg. userForCrudQuery).
     * @param allQuery GraphQL query to fetch a filtered list of objects (eg. usersForCrudQuery).
     * @param createMutation GraphQL mutation to create an object.
     * @param updateMutation GraphQL mutation to update an object.
     * @param deleteMutation GraphQL mutation to delete a list of objects.
     * @param plural list query name (eg. usersForFront or users).
     * @param createName create object mutation name (eg. createUser).
     * @param updateName update object mutation name (eg. updateUser).
     * @param deleteName delete object mutation name (eg. deleteUsers).
     */
    public constructor(
        protected readonly name: string,
        protected readonly oneQuery: DocumentNode | null,
        public readonly allQuery: DocumentNode | null,
        protected readonly createMutation: DocumentNode | null,
        protected readonly updateMutation: DocumentNode | null,
        protected readonly deleteMutation: DocumentNode | null,
        plural: string | null = null,
        private readonly createName: string | null = null,
        private readonly updateName: string | null = null,
        private readonly deleteName: string | null = null,
    ) {
        this.plural = plural ?? makePlural(this.name);
    }

    /**
     * List of individual fields validators
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormValidators(model?: Literal): FormValidators {
        return {};
    }

    /**
     * List of individual async fields validators
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormAsyncValidators(model?: Literal): FormAsyncValidators {
        return {};
    }

    /**
     * List of grouped fields validators (like password + confirm password)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormGroupValidators(model?: Literal): ValidatorFn[] {
        return [];
    }

    /**
     * List of async group fields validators (like unique constraint on multiple columns)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getFormGroupAsyncValidators(model?: Literal): AsyncValidatorFn[] {
        return [];
    }

    public getFormConfig(model: Literal): FormControls {
        const values = {...this.getDefaultForServer(), ...this.getFormExtraFieldDefaultValues()};
        const validators = this.getFormValidators(model);
        const asyncValidators = this.getFormAsyncValidators(model);
        const controls: FormControls = {};
        const disabled = model.permissions ? !model.permissions.update : false;

        if (model.id) {
            controls.id = new UntypedFormControl({value: model.id, disabled: true});
        }

        // Configure form for each field of model
        for (const key of Object.keys(values)) {
            const value = model[key] !== undefined ? model[key] : values[key];
            const formState = {
                value: value,
                disabled: disabled,
            };
            const validator = typeof validators[key] !== 'undefined' ? validators[key] : null;
            const asyncValidator = typeof asyncValidators[key] !== 'undefined' ? asyncValidators[key] : null;

            controls[key] = new UntypedFormControl(formState, validator, asyncValidator);
        }

        // Configure form for extra validators that are not on a specific field
        for (const key of Object.keys(validators)) {
            if (!controls[key]) {
                const formState = {
                    value: model[key] ? model[key] : null,
                    disabled: disabled,
                };

                controls[key] = new UntypedFormControl(formState, validators[key]);
            }
        }

        for (const key of Object.keys(asyncValidators)) {
            if (controls[key] && asyncValidators[key]) {
                controls[key].setAsyncValidators(asyncValidators[key]);
            } else {
                const formState = {
                    value: model[key] ? model[key] : null,
                    disabled: disabled,
                };

                controls[key] = new UntypedFormControl(formState, null, asyncValidators[key]);
            }
        }

        return controls;
    }

    /**
     * Create the final FormGroup for the object, including all validators
     *
     * This method should **not** be overridden, but instead `getFormConfig`,
     * `getFormGroupValidators`, `getFormGroupAsyncValidators` might be.
     */
    public getFormGroup(model: Literal): UntypedFormGroup {
        const formConfig = this.getFormConfig(deepClone(model));
        return new UntypedFormGroup(formConfig, {
            validators: this.getFormGroupValidators(model),
            asyncValidators: this.getFormGroupAsyncValidators(model),
        });
    }

    /**
     * Get a single object
     *
     * If available it will emit object from cache immediately, then it
     * will **always** fetch from network and then the observable will be completed.
     *
     * You must subscribe to start getting results (and fetch from network).
     */
    public getOne(id: string): Observable<Tone> {
        return this.prepareOneQuery(id, {fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-only'}).pipe(
            takeWhile(result => result.networkStatus !== NetworkStatus.ready, true),
            map(result => (result.data as Literal)[this.name]),
        );
    }

    /**
     * Watch a single object
     *
     * If available it will emit object from cache immediately, then it
     * will **always** fetch from network, and then keep watching the cache forever.
     *
     * You must subscribe to start getting results (and fetch from network).
     *
     * You **MUST** unsubscribe.
     */
    public watchOne(
        id: string,
        options: WatchQueryOptionsWithoutVariables<unknown, Literal> = {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-only',
        },
    ): Observable<Tone> {
        return this.prepareOneQuery(id, options).pipe(map(result => (result.data as Literal)[this.name]));
    }

    private prepareOneQuery(
        id: string,
        options: WatchQueryOptionsWithoutVariables<unknown, Literal>,
    ): Observable<ObservableQuery.Result<unknown>> {
        this.throwIfObservable(id);
        this.throwIfNotQuery(this.oneQuery);

        return this.getVariablesForOne(id).pipe(
            switchMap(variables => {
                this.throwIfNotQuery(this.oneQuery);

                return this.apollo.watchQuery<unknown, Vone>({
                    ...(options as WatchQueryOptionsWithoutVariables<unknown, Vone>),
                    query: this.oneQuery,
                    variables: variables,
                    notifyOnNetworkStatusChange: false,
                }).valueChanges;
            }),
            onlyCompleteData(),
        );
    }

    /**
     * Get a collection of objects
     *
     * It will **always** fetch from network and then the observable will be completed.
     * No cache is ever used, so it's slow but correct.
     */
    public getAll(queryVariablesManager: NaturalQueryVariablesManager<Vall>): Observable<Tall> {
        this.throwIfNotQuery(this.allQuery);

        return this.getPartialVariablesForAll().pipe(
            first(),
            switchMap(partialVariables => {
                this.throwIfNotQuery(this.allQuery);

                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', partialVariables);

                return this.apollo.query({
                    query: this.allQuery,
                    variables: manager.variables.value,
                    fetchPolicy: 'network-only',
                });
            }),
            this.mapAll(),
        );
    }

    /**
     * Get a collection of objects
     *
     * Every time the observable variables change, and they are not undefined,
     * it will return result from cache, then it will **always** fetch from network,
     * and then keep watching the cache forever.
     *
     * You must subscribe to start getting results (and fetch from network).
     *
     * You **MUST** unsubscribe.
     */
    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<Vall>,
        fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network',
    ): Observable<Tall> {
        this.throwIfNotQuery(this.allQuery);

        return combineLatest({
            variables: queryVariablesManager.variables.pipe(
                // Ignore very fast variable changes
                debounceTime(20),
                // Wait for variables to be defined to prevent duplicate query: with and without variables
                // Null is accepted value for "no variables"
                filter(variables => typeof variables !== 'undefined'),
            ),
            partialVariables: this.getPartialVariablesForAll(),
        }).pipe(
            switchMap(result => {
                // Apply partial variables from service
                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', result.partialVariables);

                this.throwIfNotQuery(this.allQuery);

                return this.apollo
                    .watchQuery({
                        query: this.allQuery,
                        variables: manager.variables.value,
                        fetchPolicy: fetchPolicy,
                        notifyOnNetworkStatusChange: false,
                    })
                    .valueChanges.pipe(
                        catchError(() => EMPTY),
                        onlyCompleteData(),
                        this.mapAll(),
                    );
            }),
        );
    }

    /**
     * This functions allow to quickly create or update objects.
     *
     * Manages a "creation is pending" status, and update when creation is ready.
     * Uses regular `create()` (with immediate effect) and `update()` (with debounced effect) methods.
     * Used mainly when editing multiple objects in the same controller, like in editable arrays.
     */
    public createOrUpdate(object: Vcreate['input'] | WithId<Vupdate['input']>): Observable<Tcreate | Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.createMutation);
        this.throwIfNotQuery(this.updateMutation);

        // If creation is pending, listen to creation observable and when ready, fire update
        const pendingCreation = this.creatingCache.get(object);
        if (pendingCreation) {
            return pendingCreation.pipe(
                switchMap(created => {
                    return this.update({
                        id: (created as WithId<Tcreate>).id,
                        ...(object as Vcreate['input']),
                    });
                }),
            );
        }

        // If object has Id, just save it
        if ('id' in object && object.id) {
            return this.update(object as WithId<Vupdate['input']>);
        }

        // If object was not saving, and has no ID, create it
        const creation = this.create(object).pipe(
            tap(() => {
                this.creatingCache.delete(object); // remove from cache
            }),
        );

        // stores creating observable in a cache replayable version of the observable,
        // so several update() can subscribe to the same creation
        this.creatingCache.set(object, creation.pipe(shareReplay()));

        return creation;
    }

    /**
     * Create an object in DB
     */
    public create(
        object: Vcreate['input'],
        options: MutateOptionsWithoutVariables<Literal, Literal> = {},
    ): Observable<Tcreate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.createMutation);

        const variables = merge(
            {input: this.getInput(object, true)},
            this.getPartialVariablesForCreation(object),
        ) as Vcreate;

        return this.apollo
            .mutate<Tcreate, Vcreate>({
                ...(options as MutateOptionsWithoutVariables<Tcreate, Vcreate>),
                mutation: this.createMutation,
                variables: variables,
            })
            .pipe(map(result => this.mapCreation(result)));
    }

    /**
     * Update an object, after a short debounce
     */
    public update(object: WithId<Vupdate['input']>): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        // Keep a single instance of the debounced update function
        const id = object.id;

        return this.naturalDebounceService.debounce(this, id, object);
    }

    /**
     * Update an object immediately when subscribing
     */
    public updateNow(
        object: WithId<Vupdate['input']>,
        options: MutateOptionsWithoutVariables<Literal, Literal> = {},
    ): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        const variables = merge(
            {
                id: object.id,
                input: this.getInput(object, false),
            },
            this.getPartialVariablesForUpdate(object),
        ) as Vupdate;

        return this.apollo
            .mutate<Tupdate, Vupdate>({
                ...(options as MutateOptionsWithoutVariables<Tupdate, Vupdate>),
                mutation: this.updateMutation,
                variables: variables,
            })
            .pipe(map(result => this.mapUpdate(result)));
    }

    /**
     * Delete objects
     */
    public delete(
        objects: {id: string}[],
        options: MutateOptionsWithoutVariables<Literal, Literal> = {},
    ): Observable<Tdelete> {
        this.throwIfObservable(objects);
        this.throwIfNotQuery(this.deleteMutation);

        const ids = objects.map(o => {
            // Cancel pending update
            this.naturalDebounceService.cancelOne(this, o.id);

            return o.id;
        });
        const variables = merge(
            {
                ids: ids,
            },
            this.getPartialVariablesForDelete(objects),
        ) as Vdelete;

        return this.apollo
            .mutate<Tdelete, Vdelete>({
                ...(options as MutateOptionsWithoutVariables<Tdelete, Vdelete>),
                mutation: this.deleteMutation,
                variables: variables,
            })
            .pipe(map(result => this.mapDelete(result)));
    }

    /**
     * If the id is provided, resolves an observable model. The observable model will only be emitted after we are sure
     * that Apollo cache is fresh and warm. Then the component can subscribe to the observable model to get the model
     * immediately from Apollo cache and any subsequents future mutations that may happen to Apollo cache.
     *
     * Without id, returns default values, in order to show a creation form.
     */
    public resolve(id: string | undefined): Observable<Observable<Tone | Vcreate['input']>> {
        if (id) {
            const onlyNetwork = this.watchOne(id, {fetchPolicy: 'network-only'}).pipe(first());
            const onlyCache = this.watchOne(id, {fetchPolicy: 'cache-first', nextFetchPolicy: 'cache-and-network'});

            // In theory, we can rely on Apollo Cache to return a result instantly. It is very fast indeed,
            // but it is still asynchronous, so there may be a very short time when we don't have the model
            // available. To fix that, we can rely on RxJS, which is able to emit synchronously the value we just
            // got from server. Once Apollo Client moves to RxJS (https://github.com/apollographql/apollo-feature-requests/issues/375),
            // we could try to remove `startWith()`.
            return onlyNetwork.pipe(map(firstValue => onlyCache.pipe(startWith(firstValue))));
        } else {
            return of(of(this.getDefaultForServer()));
        }
    }

    /**
     * Return an object that match the GraphQL input type.
     * It creates an object with manually filled data and add uncompleted data (like required attributes that can be empty strings)
     */
    public getInput(object: Literal, forCreation: boolean): Vcreate['input'] | Vupdate['input'] {
        // Convert relations to their IDs for mutation
        object = relationsToIds(object);

        // Pick only attributes that we can find in the empty object
        // In other words, prevent to select data that has unwanted attributes
        const emptyObject = this.getDefaultForServer();
        let input = pick(object, Object.keys(emptyObject));

        // Complete a potentially uncompleted object with default values
        if (forCreation) {
            input = defaults(input, emptyObject);
        }

        return input;
    }

    /**
     * Return the number of objects matching the query. It may never complete.
     *
     * This is used for the unique validator
     */
    public count(queryVariablesManager: NaturalQueryVariablesManager<Vall>): Observable<number> {
        const queryName = 'Count' + upperCaseFirstLetter(this.plural);
        const filterType = upperCaseFirstLetter(this.name) + 'Filter';

        const query = gql<{count: {length: number}}, Literal>`
            query ${queryName} ($filter: ${filterType}) {
            count: ${this.plural} (filter: $filter, pagination: {pageSize: 0, pageIndex: 0}) {
            length
            }
            }`;

        return this.getPartialVariablesForAll().pipe(
            switchMap(partialVariables => {
                // Copy manager to prevent to apply internal variables to external QueryVariablesManager
                const manager = new NaturalQueryVariablesManager<Vall>(queryVariablesManager);
                manager.merge('partial-variables', partialVariables);

                return this.apollo.query({
                    query: query,
                    variables: manager.variables.value,
                    fetchPolicy: 'network-only',
                });
            }),
            map(result => result.data!.count.length),
        );
    }

    /**
     * Return empty object with some default values from server perspective
     *
     * This is typically useful when showing a form for creation
     */
    public getDefaultForServer(): Vcreate['input'] {
        return {};
    }

    /**
     * You probably **should not** use this.
     *
     * If you are trying to *call* this method, instead you probably want to call `getDefaultForServer()` to get default
     * values for a model, or `getFormConfig()` to get a configured form that includes extra form fields.
     *
     * If you are trying to *override* this method, instead you probably want to override `getDefaultForServer()`.
     *
     * The only and **very rare** reason to override this method is if the client needs extra form fields that cannot be
     * accepted by the server (not part of `XXXInput` type) and that are strictly for the client form needs. In that case,
     * then you can return default values for those extra form fields, and the form returned by `getFormConfig()` will
     * include those extra fields.
     */
    protected getFormExtraFieldDefaultValues(): Literal {
        return {};
    }

    /**
     * This is used to extract only the array of fetched objects out of the entire fetched data
     */
    protected mapAll(): OperatorFunction<ApolloLink.Result<unknown>, Tall> {
        return map(result => (result as any).data[this.plural]); // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only the created object out of the entire fetched data
     */
    protected mapCreation(result: Apollo.MutateResult): Tcreate {
        const name = this.createName ?? 'create' + upperCaseFirstLetter(this.name);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only the updated object out of the entire fetched data
     */
    protected mapUpdate(result: Apollo.MutateResult): Tupdate {
        const name = this.updateName ?? 'update' + upperCaseFirstLetter(this.name);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * This is used to extract only flag when deleting an object
     */
    protected mapDelete(result: Apollo.MutateResult): Tdelete {
        const name = this.deleteName ?? 'delete' + upperCaseFirstLetter(this.plural);
        return (result.data as any)[name]; // See https://github.com/apollographql/apollo-client/issues/5662
    }

    /**
     * Returns additional variables to be used when getting a single object
     *
     * This is typically a site or state ID, and is needed to get appropriate access rights
     */
    protected getPartialVariablesForOne(): Observable<Partial<Vone>> {
        return of({});
    }

    /**
     * Returns additional variables to be used when getting multiple objects
     *
     * This is typically a site or state ID, but it could be something else to further filter the query
     */
    public getPartialVariablesForAll(): Observable<Partial<Vall>> {
        return of({});
    }

    /**
     * Returns additional variables to be used when creating an object
     *
     * This is typically a site or state ID
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getPartialVariablesForCreation(object: Literal): Partial<Vcreate> {
        return {};
    }

    /**
     * Returns additional variables to be used when updating an object
     *
     * This is typically a site or state ID
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getPartialVariablesForUpdate(object: Literal): Partial<Vupdate> {
        return {};
    }

    /**
     * Return additional variables to be used when deleting an object
     *
     * This is typically a site or state ID
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getPartialVariablesForDelete(objects: Literal[]): Partial<Vdelete> {
        return {};
    }

    /**
     * Throw exception to prevent executing queries with invalid variables
     */
    protected throwIfObservable(value: unknown): void {
        if (value instanceof Observable) {
            throw new Error(
                'Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value',
            );
        }
    }

    /**
     * Merge given ID with additional partial variables if there is any
     */
    private getVariablesForOne(id: string): Observable<Vone> {
        return this.getPartialVariablesForOne().pipe(
            map(partialVariables => merge({id: id} as Vone, partialVariables)),
        );
    }

    /**
     * Throw exception to prevent executing null queries
     */
    private throwIfNotQuery(query: DocumentNode | null): asserts query {
        if (!query) {
            throw new Error('GraphQL query for this method was not configured in this service constructor');
        }
    }
}
