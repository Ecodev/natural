import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {By} from '@angular/platform-browser';
import {type FormControl, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NaturalPercentageInputDirective} from './percentage-input.directive';

@Component({
    imports: [NaturalPercentageInputDirective, ReactiveFormsModule],
    template: ` <form [formGroup]="form">
        <input type="number" percentageInput [formControl]="form.controls.value0" />
        <input type="number" percentageInput formControlName="value1" />
    </form>`,
    changeDetection: ChangeDetectionStrategy.Eager,
})
class TestComponent {
    private readonly fb = inject(NonNullableFormBuilder);
    public readonly form = this.fb.group({
        value0: [0.5],
        value1: [0.28],
    });
}

function assertInput(
    input: HTMLInputElement,
    control: FormControl<number | null>,
    modelValue: number | null,
    uiValue: string,
): void {
    expect(input.value).toBe(uiValue);
    expect(control.value).toBe(modelValue);
}

async function humanChange(
    fixture: ComponentFixture<TestComponent>,
    input: HTMLInputElement,
    newValue: string,
): Promise<unknown> {
    // simulate user entering a new name into the input box
    input.value = newValue;

    // Dispatch a DOM event so that Angular learns of input value change.
    input.dispatchEvent(new Event('input'));

    // Wait for Angular to update the display binding through the title pipe
    return fixture.whenStable();
}

async function modelChange(
    fixture: ComponentFixture<TestComponent>,
    control: FormControl<number | null>,
    newValue: number | null,
): Promise<unknown> {
    control.setValue(newValue);

    // Wait for Angular to update the display binding through the title pipe
    return fixture.whenStable();
}

describe('NaturalPercentageInputDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let elements: HTMLInputElement[]; // the elements with the directive
    let controls: {
        value0: FormControl<number | null>;
        value1: FormControl<number | null>;
    };

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({}).createComponent(TestComponent);

        fixture.detectChanges(); // initial binding

        elements = fixture.debugElement.queryAll(By.css('input')).map(element => element.nativeElement);
        controls = fixture.componentInstance.form.controls;
    });

    it('initial value', async () => {
        await fixture.whenStable();
        assertInput(elements[0], controls.value0, 0.5, '50');
        assertInput(elements[1], controls.value1, 0.28, '28');
    });

    it('human change formControl value', async () => {
        await humanChange(fixture, elements[0], '95');

        assertInput(elements[0], controls.value0, 0.95, '95');
    });

    it('human change formControlName value', async () => {
        await humanChange(fixture, elements[1], '77');

        assertInput(elements[1], controls.value1, 0.77, '77');
    });

    it('model change formControl value', async () => {
        await modelChange(fixture, controls.value0, 1);

        assertInput(elements[0], controls.value0, 1, '100');
    });

    it('model change formControl value', async () => {
        await modelChange(fixture, controls.value1, 0.01);

        assertInput(elements[1], controls.value1, 0.01, '1');
    });

    it('human clear value', async () => {
        await humanChange(fixture, elements[0], '');

        assertInput(elements[0], controls.value0, null, '');
    });

    it('model clear value', async () => {
        await modelChange(fixture, controls.value0, null);

        assertInput(elements[0], controls.value0, null, '');
    });
});
