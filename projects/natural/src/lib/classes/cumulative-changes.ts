import {cloneDeep, isEqual} from 'lodash-es';
import {Literal} from '../types/types';
import {ReadonlyDeep} from 'type-fest';

/**
 * Cumulate all changes made to an object over time
 */
export class CumulativeChanges<T extends Literal> {
    #original: T = {} as T;
    #diff: Partial<T> = {};

    /**
     * Initialize the original values, should be called exactly one time per instance
     */
    public initialize(originalValues: Readonly<T>): void {
        this.#original = cloneDeep(originalValues);
        this.#diff = {};
    }

    /**
     * Returns a literal that contains only the keys whose values have been changed by this call or any previous calls.
     *
     * Eg:
     *
     * ```ts
     * changes.initialize({a: 1, b: 2});
     * changes.differences({a: 1, b: 3}); // => {b: 3}
     * ```
     */
    public differences(newValues: ReadonlyDeep<T>): Partial<T> | null {
        Object.keys(newValues).forEach(key => {
            if (
                key in this.#diff ||
                (newValues[key] !== undefined &&
                    (!(key in this.#original) || !isEqual(this.#original[key], newValues[key])))
            ) {
                (this.#diff as any)[key] = newValues[key];
            }
        });

        return Object.keys(this.#diff).length ? this.#diff : null;
    }

    /**
     * Commit the given new values, so they are not treated as differences anymore.
     */
    public commit(newValues: ReadonlyDeep<T>): void {
        this.#original = {
            ...this.#original,
            ...cloneDeep(newValues),
        };

        Object.keys(newValues).forEach(key => {
            if (key in this.#diff && isEqual(this.#diff[key], newValues[key])) {
                delete this.#diff[key];
            }
        });
    }
}
