import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {pickBy} from 'es-toolkit';
import {Observable, switchMap, take} from 'rxjs';
import {filter} from 'rxjs/operators';
import type {ReadonlyDeep} from 'type-fest';
import {Literal} from '../types/types';
import {PaginationInput, Sorting, SortingOrder} from './query-variable-manager';
import {cloneDeepWith} from 'es-toolkit';

/**
 * Very basic formatting to get only date, without time and ignoring entirely the timezone
 *
 * So something like: "2021-09-23"
 */
export function formatIsoDate(date: null): null;
export function formatIsoDate(date: Date): string;
export function formatIsoDate(date: Date | null): string | null;
export function formatIsoDate(date: Date | null): string | null {
    if (!date) {
        return null;
    }

    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
}

/**
 * Format a date and time in a way that will preserve the local time zone.
 * This allows the server side to know the day (without time) that was selected on client side.
 *
 * So something like: "2021-09-23T17:57:16+09:00"
 */
export function formatIsoDateTime(date: Date): string {
    const timezoneOffsetInMinutes = date.getTimezoneOffset();
    const timezoneOffsetInHours = -Math.trunc(timezoneOffsetInMinutes / 60); // UTC minus local time
    const sign = timezoneOffsetInHours >= 0 ? '+' : '-';
    const hoursLeadingZero = Math.abs(timezoneOffsetInHours) < 10 ? '0' : '';
    const remainderMinutes = -(timezoneOffsetInMinutes % 60);
    const minutesLeadingZero = Math.abs(remainderMinutes) < 10 ? '0' : '';

    // It's a bit unfortunate that we need to construct a new Date instance,
    // but we don't want the original Date instance to be modified
    const correctedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    );
    correctedDate.setHours(date.getHours() + timezoneOffsetInHours);

    const iso = correctedDate
        .toISOString()
        .replace(/\.\d{3}Z/, '')
        .replace('Z', '');

    return (
        iso +
        sign +
        hoursLeadingZero +
        Math.abs(timezoneOffsetInHours).toString() +
        ':' +
        minutesLeadingZero +
        remainderMinutes
    );
}

/**
 * Relations to full objects are converted to their IDs only.
 *
 * So {user: {id: 123}} becomes {user: 123}
 */
export function relationsToIds(object: Literal): Literal {
    const newObj: Literal = {};
    Object.keys(object).forEach(key => {
        let value: unknown = object[key];

        if (value === null || value === undefined) {
            // noop
        } else if (hasId(value)) {
            value = value.id;
        } else if (Array.isArray(value)) {
            value = value.map((i: unknown) => (hasId(i) ? i.id : i));
        } else if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Date)) {
            value = pickBy(value, (v, k) => k !== '__typename'); // omit(value, ['__typename']) ?
        }

        newObj[key] = value;
    });

    return newObj;
}

function hasId(value: unknown): value is {id: unknown} {
    return !!value && typeof value === 'object' && 'id' in value && !!value.id;
}

/**
 * Returns the plural form of the given name
 *
 * This is **not** necessarily valid english grammar. Its only purpose is for internal usage, not for humans.
 *
 * This **MUST** be kept in sync with `\Ecodev\Felix\Api\Plural:make()`.
 *
 * This is a bit performance-sensitive, so we should keep it fast and only cover cases that we actually need.
 */
export function makePlural(name: string): string {
    // Words ending in a y preceded by a vowel form their plurals by adding -s:
    if (/[aeiou]y$/.exec(name)) {
        return name + 's';
    }

    const plural = name + 's';

    return plural.replace(/ys$/, 'ies').replace(/ss$/, 'ses').replace(/xs$/, 'xes');
}

/**
 * Returns the string with the first letter as capital
 */
export function upperCaseFirstLetter(term: string): string {
    return term.charAt(0).toUpperCase() + term.slice(1);
}

/**
 * Replace all attributes of first object with the ones provided by the second, but keeps the reference
 */
export function replaceObjectKeepingReference(obj: Literal | null, newObj: Literal | null): void {
    if (!obj || !newObj) {
        return;
    }

    Object.keys(obj).forEach(key => {
        delete obj[key];
    });

    Object.keys(newObj).forEach(key => {
        obj[key] = newObj[key];
    });
}

/**
 * Get contrasted color for text in the slider thumb
 * @param hexBgColor string in hexadecimals representing the background color
 */
export function getForegroundColor(hexBgColor: string): 'black' | 'white' {
    const rgb = hexToRgb(hexBgColor.slice(0, 7)); // splice remove alpha and consider only "visible" color at 100% alpha
    const o = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);

    return o > 125 ? 'black' : 'white';
}

function hexToRgb(hex: string): {r: number; g: number; b: number} {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : {
              r: 0,
              g: 0,
              b: 0,
          };
}

/**
 * Convert RGB color to hexadecimal color
 *
 * ```ts
 * rgbToHex('rgb(255, 00, 255)'); // '#FF00FF'
 * ```
 */
export function rgbToHex(rgb: string): string {
    const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    if (!m) {
        return rgb;
    }

    return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).toUpperCase().padStart(2, '0')).join('');
}

/**
 * Deep clone given values except for `File` that will be referencing the original value
 */
export function cloneDeepButSkipFile<T>(value: T): T {
    return cloneDeepWith(value, v => (isFile(v) ? v : undefined));
}

export function isFile(value: unknown): boolean {
    return (
        (typeof File !== 'undefined' && value instanceof File) ||
        (typeof Blob !== 'undefined' && value instanceof Blob) ||
        (typeof FileList !== 'undefined' && value instanceof FileList)
    );
}

/**
 * During lodash.mergeWith, overrides arrays
 */
export function mergeOverrideArray(destValue: unknown, source: unknown): unknown {
    if (Array.isArray(source) || isFile(source)) {
        return source;
    }
}

/**
 * Copy text to clipboard.
 * Accepts line breaks `\n` as textarea do.
 */
export function copyToClipboard(document: Document, text: string): void {
    const input = document.createElement('textarea');
    document.body.append(input);
    input.value = text;
    input.select();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand('copy');
    document.body.removeChild(input);
}

export function deepFreeze<T extends Literal>(o: T): ReadonlyDeep<T> {
    Object.values(o).forEach(v => Object.isFrozen(v) || deepFreeze(v));

    return Object.freeze(o) as ReadonlyDeep<T>;
}

/**
 * Return a valid PaginationInput from whatever is available from data. Invalid properties/types will be dropped.
 */
export function validatePagination(data: unknown): PaginationInput | null {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
    }

    const pagination: PaginationInput = {};

    if ('offset' in data && (data.offset === null || typeof data.offset === 'number')) {
        pagination.offset = data.offset;
    }

    if ('pageIndex' in data && (data.pageIndex === null || typeof data.pageIndex === 'number')) {
        pagination.pageIndex = data.pageIndex;
    }

    if ('pageSize' in data && (data.pageSize === null || typeof data.pageSize === 'number')) {
        pagination.pageSize = data.pageSize;
    }

    return pagination;
}

/**
 * Return a valid Sortings from whatever is available from data. Invalid properties/types will be dropped.
 */
export function validateSorting(data: unknown): Sorting[] | null {
    if (!Array.isArray(data)) {
        return null;
    }
    const result: Sorting[] = [];
    data.forEach(s => {
        const r = validateOneSorting(s);
        if (r) {
            result.push(r);
        }
    });

    return result;
}

function validateOneSorting(data: unknown): Sorting | null {
    if (!data || typeof data !== 'object' || !('field' in data)) {
        return null;
    }

    const sorting: Sorting = {field: data.field};

    if (
        'order' in data &&
        (data.order === SortingOrder.ASC || data.order === SortingOrder.DESC || data.order === null)
    ) {
        sorting.order = data.order;
    }

    if ('nullAsHighest' in data && (data.nullAsHighest === null || typeof data.nullAsHighest === 'boolean')) {
        sorting.nullAsHighest = data.nullAsHighest;
    }

    if (
        'emptyStringAsHighest' in data &&
        (data.emptyStringAsHighest === null || typeof data.emptyStringAsHighest === 'boolean')
    ) {
        sorting.emptyStringAsHighest = data.emptyStringAsHighest;
    }

    return sorting;
}

/**
 * Return valid columns from whatever is available from data. Invalid properties/types will be dropped.
 */
export function validateColumns(data: unknown): string[] | null {
    if (typeof data !== 'string') {
        return null;
    }

    return data.split(',').filter(string => string);
}

export function onHistoryEvent(router: Router): Observable<NavigationEnd> {
    return router.events.pipe(
        filter(e => e instanceof NavigationStart && e.navigationTrigger === 'popstate'),
        switchMap(() =>
            router.events.pipe(
                filter(e => e instanceof NavigationEnd),
                take(1),
            ),
        ),
    );
}
