import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, DoCheck, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormControlDirective,
    FormControlName,
    NgControl,
    Validators,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

/**
 * This will completely ignore internal formControl and instead use the one from the component
 * which comes from outside of this component. This basically allows us to **not** depend on
 * touched status propagation between outside and inside world, and thus get rid of our legacy
 * custom FormControl class ("NaturalFormControl").
 */
class ExternalFormControlMatcher<T, I> extends ErrorStateMatcher {
    public constructor(private readonly component: AbstractSelect<T, I>) {
        super();
    }

    public override isErrorState(): boolean {
        const externalCtrl = this.component.ngControl?.control || this.component.internalCtrl;
        if (externalCtrl) {
            return !!(externalCtrl.errors && (externalCtrl.touched || externalCtrl.dirty));
        }

        return false;
    }
}

@Directive({standalone: true})
export abstract class AbstractSelect<V, I> implements OnInit, ControlValueAccessor, DoCheck {
    @Input() public placeholder?: string;

    /**
     * Mat-hint
     */
    @Input() public hint: string | null = null;

    /**
     * If the field is required
     */
    @Input()
    public set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
        this.applyRequired();
    }

    public get required(): boolean {
        return !!this._required;
    }

    private _required: boolean | undefined;

    /**
     * Add a suffix button that is a link to given destination
     */
    @Input() public navigateTo?: any[] | string | null;

    /**
     * If provided cause a new clear button to appear
     */
    @Input() public clearLabel?: string;

    /**
     * Whether to show the search icon
     */
    @Input() public showIcon = true;

    /**
     * Icon name
     */
    @Input() public icon = 'search';

    /**
     * Function to customize the rendering of the selected item as text in input
     */
    @Input() public displayWith?: (item: V | null) => string;

    /**
     * Emit the selected value whenever it changes
     */
    @Output() public readonly selectionChange = new EventEmitter<V | null>();

    /**
     * Emits when internal input is blurred
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() public readonly blur = new EventEmitter<void>();

    /**
     * Contains internal representation for current selection AND searched text (for autocomplete)
     *
     * It is **not** necessarily `V | null`.
     *
     * - NaturalSelectComponent: `string | V | null`. We allow `string`
     *   only when `optionRequired` is false, so most of the time it is `V | null`.
     * - NaturalSelectHierarchicComponent: `string | null`.
     * - NaturalSelectEnumComponent: `V | null`.
     *
     * In natural-select context, we use pristine and dirty to identify if the displayed value is search or committed model :
     *  - Pristine status (unchanged value) means the model is displayed and propagated = the selection is committed
     *  - Dirty status (changed value) means we are in search/autocomplete mode
     */
    public readonly internalCtrl = new FormControl<I | null>(null);

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    public onChange?: (item: V | null) => void;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    public onTouched?: () => void;

    public readonly matcher: ExternalFormControlMatcher<V, I>;

    public constructor(@Optional() @Self() public readonly ngControl: NgControl | null) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

        this.matcher = new ExternalFormControlMatcher(this);
    }

    public ngDoCheck(): void {
        if (this.ngControl) {
            this.applyRequired();
        }
    }

    public writeValue(value: I | null): void {
        this.internalCtrl.setValue(value);
    }

    public ngOnInit(): void {
        const isReactive = this.ngControl instanceof FormControlDirective || this.ngControl instanceof FormControlName;
        if (isReactive && typeof this._required !== 'undefined') {
            console.warn('<natural-select-*> should not be used as ReactiveForm and with the [required] attribute');
        }
    }

    /**
     * Whether the value can be changed
     */
    @Input()
    public set disabled(disabled: boolean) {
        disabled ? this.internalCtrl.disable() : this.internalCtrl.enable();
    }

    public registerOnChange(fn: (item: V | null) => void): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    public abstract getDisplayFn(): (item: V | null) => string;

    /**
     * Commit the model to null
     * Emit and event to update the model
     */
    public clear(): void {
        this.internalCtrl.setValue(null);
        this.propagateValue(null);
    }

    /**
     * If input is dirty (search running) restore to model value
     */
    public onBlur(): void {
        this.touch();
        this.blur.emit();
    }

    /**
     * Commit the model change
     */
    public propagateValue(value: V | null): void {
        // before selectionChange to allow formControl to update before change is effectively emitted
        if (this.onChange) {
            this.onChange(value);
        }

        this.selectionChange.emit(value);
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public showClearButton(): boolean {
        return this.internalCtrl?.enabled && !!this.clearLabel && !!this.internalCtrl.value;
    }

    public touch(): void {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    public hasRequiredError(): boolean {
        const control = this.ngControl?.control ? this.ngControl?.control : this.internalCtrl;

        return control.hasError('required');
    }

    /**
     * Apply Validators.required on the internal form, based on ngControl or [required] attribute, giving priority to attribute.
     */
    private applyRequired(): void {
        // Required status on parent validator
        const outerRequiredStatus = this?.ngControl?.control?.validator?.({} as AbstractControl)?.required;

        // Wanted required status, giving priority to template
        const newRequiredStatus = typeof this._required !== 'undefined' ? this._required : outerRequiredStatus;

        // Actual internal validation status
        const currentRequiredStatus = this.internalCtrl?.validator?.({} as AbstractControl)?.required;

        // If wanted status is similar to actual status, stop everything
        if (currentRequiredStatus === newRequiredStatus) {
            return;
        }

        // Apply only if changed
        if (newRequiredStatus) {
            this.internalCtrl.setValidators(Validators.required);
        } else {
            this.internalCtrl.clearValidators();
        }

        this.internalCtrl.updateValueAndValidity();
    }
}
