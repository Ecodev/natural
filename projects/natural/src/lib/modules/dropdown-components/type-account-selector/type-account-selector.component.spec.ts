import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FilterGroupConditionField, TypeHierarchicSelectorConfiguration} from '@ecodev/natural';
import {NATURAL_DROPDOWN_DATA} from '../../search/dropdown-container/dropdown.service';
import {ItemService} from '../../../testing/item.service';
import {testAssociationSelectCreation, testAssociationSelectValidating, TestFixture} from '../testing/utils';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {type Extra, TypeAccountSelectorComponent} from './type-account-selector.component';

type FilterGroupConditionFieldWithExtra = FilterGroupConditionField & {
    have?: Partial<Extra> | null;
    empty?: Partial<Extra> | null;
};

const conditionIs: FilterGroupConditionFieldWithExtra = {
    have: {values: ['123'], where: 'DebitOrCredit', recursive: false},
};

const conditionIsDebitRecursive: FilterGroupConditionFieldWithExtra = {
    have: {values: ['123'], where: 'Debit', recursive: true},
};

const conditionIsNot: FilterGroupConditionFieldWithExtra = {
    have: {values: ['123'], not: true, where: 'DebitOrCredit', recursive: false},
};

const conditionAny: FilterGroupConditionFieldWithExtra = {
    empty: {not: true, where: 'Credit', recursive: false},
};

const conditionNone: FilterGroupConditionFieldWithExtra = {
    empty: {not: false, where: 'DebitOrCredit', recursive: false},
};

function createComponent(
    fixture: TestFixture<TypeAccountSelectorComponent, TypeHierarchicSelectorConfiguration>,
    condition: FilterGroupConditionFieldWithExtra | null,
): void {
    const configuration: TypeHierarchicSelectorConfiguration = {
        key: 'any',
        service: null as any, // This will be completed as soon as we finished configuring our TestBed
        config: [
            {
                service: ItemService,
                parentsRelationNames: ['parent'],
                childrenRelationNames: ['parent'],
                selectableAtKey: 'any',
            },
        ],
    };
    fixture.data.condition = condition;
    fixture.data.configuration = configuration;

    TestBed.overrideProvider(NATURAL_DROPDOWN_DATA, {useValue: fixture.data});

    configuration.service = TestBed.inject(ItemService);

    fixture.component =
        TestBed.createComponent<TypeAccountSelectorComponent>(TypeAccountSelectorComponent).componentInstance;

    tick(5000);
}

describe('TypeAccountSelectorComponent', () => {
    const fixture: TestFixture<TypeAccountSelectorComponent, TypeHierarchicSelectorConfiguration> = {
        component: null as any,
        data: {
            condition: null,
            configuration: null as any,
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockApolloProvider,
                {
                    provide: NATURAL_DROPDOWN_DATA,
                    useValue: fixture.data,
                },
            ],
        }).compileComponents();
    });

    testAssociationSelectCreation(fixture, createComponent);
    testAccountSelectReloading(fixture);
    testAccountSelectRendering(fixture);
    testAssociationSelectValidating(fixture, createComponent);
});

export function testAccountSelectReloading(
    t: TestFixture<TypeAccountSelectorComponent, TypeHierarchicSelectorConfiguration>,
): void {
    it('should get empty condition without value', fakeAsync(() => {
        const empty: FilterGroupConditionFieldWithExtra = {};

        createComponent(t, null);
        expect(t.component.getCondition()).toEqual(empty);
    }));

    it('should get `is` condition', fakeAsync(() => {
        createComponent(t, conditionIs);
        expect(t.component.getCondition()).toEqual(conditionIs);
        expect(t.component.getCondition()).not.toBe(conditionIs);
    }));

    it('should get `is` condition only debit and recursive', fakeAsync(() => {
        createComponent(t, conditionIsDebitRecursive);
        expect(t.component.getCondition()).toEqual(conditionIsDebitRecursive);
        expect(t.component.getCondition()).not.toBe(conditionIsDebitRecursive);
    }));

    it('should get `isNot` condition', fakeAsync(() => {
        createComponent(t, conditionIsNot);
        expect(t.component.getCondition()).toEqual(conditionIsNot);
        expect(t.component.getCondition()).not.toBe(conditionIsNot);
    }));

    it('should get `any` condition', fakeAsync(() => {
        createComponent(t, conditionAny);
        expect(t.component.getCondition()).toEqual(conditionAny);
        expect(t.component.getCondition()).not.toBe(conditionAny);
    }));

    it('should get `none` condition', fakeAsync(() => {
        createComponent(t, conditionNone);
        expect(t.component.getCondition()).toEqual(conditionNone);
        expect(t.component.getCondition()).not.toBe(conditionNone);
    }));
}

export function testAccountSelectRendering(
    t: TestFixture<TypeAccountSelectorComponent, TypeHierarchicSelectorConfiguration>,
): void {
    it('should render `null` as empty string', fakeAsync(() => {
        createComponent(t, null);
        expect(t.component.renderedValue.value).toBe('');
    }));

    it('should render `is` value as string', fakeAsync(() => {
        createComponent(t, conditionIs);
        expect(t.component.renderedValue.value).toBe('est name-123');
    }));

    it('should render `isNot` value as string', fakeAsync(() => {
        createComponent(t, conditionIsNot);
        expect(t.component.renderedValue.value).toBe("n'est pas name-123");
    }));

    it('should render `any` value as string', fakeAsync(() => {
        createComponent(t, conditionAny);
        expect(t.component.renderedValue.value).toBe('avec au crédit');
    }));

    it('should render `none` value as string', fakeAsync(() => {
        createComponent(t, conditionNone);
        expect(t.component.renderedValue.value).toBe('sans');
    }));
}
