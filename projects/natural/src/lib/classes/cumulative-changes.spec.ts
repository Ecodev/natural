import {Literal} from '@ecodev/natural';
import {CumulativeChanges} from './cumulative-changes';

describe('CumulativeChanges', () => {
    const date1 = new Date('2000-01-02');
    const date1bis = new Date('2000-01-02');
    const date2 = new Date('2000-11-11');
    const file1 = new File([], 'image.jpg');
    const file2 = new File([], 'image.jpg');
    let changes: CumulativeChanges<Literal>;
    beforeEach(() => {
        changes = new CumulativeChanges<Literal>();
    });

    it('should be in valid state after construction', () => {
        expect(changes.differences({})).toBeNull();
    });

    it('initialize should reset all internal states', () => {
        changes.initialize({a: 1});
        expect(changes.differences({a: 2})).toEqual({a: 2});

        changes.initialize({});
        expect(changes.differences({})).toBeNull();

        changes.initialize({a: 1});
        expect(changes.differences({})).toBeNull();
    });

    it('should return an object with only the properties whose values are different', () => {
        changes.initialize({a: 1, b: 2});
        expect(changes.differences({a: 1, b: 2})).toBeNull();

        changes.initialize({a: 1, b: 2});
        expect(changes.differences({a: 1, b: 3})).toEqual({b: 3});

        changes.initialize({a: 1, b: 2});
        expect(changes.differences({a: 1, b: 2, c: undefined})).toBeNull();

        changes.initialize({a: 1, b: 2});
        expect(changes.differences({a: 1, b: 2, c: null})).toEqual({c: null});

        changes.initialize({a: 1, b: 2});
        expect(changes.differences({a: 1})).toBeNull();

        changes.initialize({a: 1, b: 2});
        expect(changes.differences({c: 3, d: 4})).toEqual({c: 3, d: 4});

        changes.initialize({a: 1, b: 2});
        expect(changes.differences({})).toBeNull();

        changes.initialize({});
        expect(changes.differences({a: 1, b: 2})).toEqual({a: 1, b: 2});

        changes.initialize({a: date1});
        expect(changes.differences({a: date1})).toBeNull();

        changes.initialize({a: date1});
        expect(changes.differences({a: date1bis})).toBeNull();

        changes.initialize({a: date1});
        expect(changes.differences({a: date2})).toEqual({a: date2});

        changes.initialize({a: file1});
        expect(changes.differences({a: file1})).toBeNull();

        changes.initialize({a: file1});
        expect(changes.differences({a: file2})).toEqual({a: file2});

        changes.initialize({a: [1, 2]});
        expect(changes.differences({a: [1, 2]})).toBeNull();

        changes.initialize({a: [1, 2]});
        expect(changes.differences({a: [2, 1]})).toEqual({a: [2, 1]});
    });

    /**
     * This is required because `NaturalDebounceService.debounce` cumulate all fields that have ever been debounced
     * (which is a good thing when we use `NaturalAbstractModelService.update()` directly), and it has no way to "remove a field".
     *
     * Eg, if `CumulativeChanges` does not cumulate, and we make a change, `{a: 2}`, and then quickly change back to
     * `{a: 1}`, then `NaturalDebounceService` will see `{a: 2}`, which get debounced, then `{}`. So the final XHR
     * actually issued by `NaturalDebounceService` would be the incorrect `{a: 2}`. By cumulating differences over time,
     * we can tell `NaturalDebounceService` "please be sure it comes back to original value, `{a: 1}`".
     */
    it('should cumulate changes over time, even if going back to original state', () => {
        changes.initialize({a: 1});
        expect(changes.differences({a: 1})).toBeNull();
        expect(changes.differences({a: 2})).toEqual({a: 2});
        expect(changes.differences({a: 1})).toEqual({a: 1});
        expect(changes.differences({})).toEqual({a: 1});
    });

    it('should work on same object', () => {
        const object = {a: 1};
        changes.initialize(object);
        object.a = 2;
        expect(changes.differences(object)).toEqual({a: 2});
    });

    it('should commit specific values', () => {
        changes.initialize({a: 1});
        const newValues = {a: 2, b: 2};

        expect(changes.differences(newValues)).toEqual({a: 2, b: 2});
        expect(changes.differences({a: 3})).toEqual({a: 3, b: 2});

        changes.commit(newValues);

        expect(changes.differences({})).toEqual({a: 3});
    });

    it('commit empty values has no effect', () => {
        expect(changes.differences({a: 1})).toEqual({a: 1});

        changes.commit({});

        expect(changes.differences({})).toEqual({a: 1});
    });
});
