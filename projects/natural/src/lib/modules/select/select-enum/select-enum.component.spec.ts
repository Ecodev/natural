import {Component, DebugElement} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {NaturalEnumService, NaturalSelectEnumComponent} from '@ecodev/natural';
import {AnyEnumService} from '../../../testing/any-enum.service';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {
    AbstractTestHostWithFormControlComponent,
    AbstractTestHostWithNgModelComponent,
    testAllSelectCommonBehavior,
    TestFixture,
} from '../testing/utils';

@Component({
    template: `
        <natural-select-enum
            enumName="FooEnum"
            placeholder="ngModel"
            i18n-placeholder
            [required]="required"
            [disabled]="disabled"
            [(ngModel)]="myValue"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
        />
    `,
    imports: [FormsModule, NaturalSelectEnumComponent],
})
class TestHostWithNgModelComponent extends AbstractTestHostWithNgModelComponent {}

@Component({
    template: `
        <natural-select-enum
            enumName="FooEnum"
            placeholder="formControl"
            i18n-placeholder
            [formControl]="formControl"
            (selectionChange)="onSelection($event)"
            (blur)="onBlur()"
        />
    `,
    imports: [ReactiveFormsModule, NaturalSelectEnumComponent],
})
class TestHostWithFormControlComponent extends AbstractTestHostWithFormControlComponent {}

describe('NaturalSelectEnumComponent', () => {
    const data: TestFixture<NaturalSelectEnumComponent> = {
        hostComponent: null as any,
        selectComponent: null as any,
        fixture: null as any,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                {
                    provide: NaturalEnumService,
                    useClass: AnyEnumService,
                },
                MockApolloProvider,
            ],
        }).compileComponents();
    });

    describe('with ngModel', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithNgModelComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectEnumComponent)).context;
            data.fixture.detectChanges();
        });

        testSelectEnumComponent(data);
    });

    describe('with formControl', () => {
        beforeEach(() => {
            data.fixture = TestBed.createComponent(TestHostWithFormControlComponent);
            data.hostComponent = data.fixture.componentInstance;
            data.selectComponent = data.fixture.debugElement.query(By.directive(NaturalSelectEnumComponent)).context;
            data.fixture.detectChanges();
        });

        testSelectEnumComponent(data);
    });
});

function getMaterialInput(data: TestFixture): HTMLInputElement {
    return data.fixture.debugElement.query(By.css('mat-select')).nativeElement;
}

function getDisabledInput(data: TestFixture): DebugElement | null {
    return data.fixture.debugElement.query(By.css('mat-select.mat-mdc-select-disabled'));
}

function testSelectEnumComponent(data: TestFixture<NaturalSelectEnumComponent>): void {
    testAllSelectCommonBehavior(data, getMaterialInput, getDisabledInput);

    it(`a single option should be disabled-able`, () => {
        // Set disabled option
        data.selectComponent.optionDisabled = item => item.value === 'val2';

        // Open the mat-select
        const matSelect = getMaterialInput(data);
        matSelect.click();
        data.fixture.detectChanges();

        const disabledOptions = data.fixture.debugElement.queryAll(By.css('.mdc-list-item--disabled'));
        expect(disabledOptions.length).toBe(1);
    });
}
