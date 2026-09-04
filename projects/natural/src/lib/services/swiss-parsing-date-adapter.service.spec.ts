import {TestBed} from '@angular/core/testing';
import {formatIsoDate} from '../classes/utility';
import {NaturalSwissParsingDateAdapter} from './swiss-parsing-date-adapter.service';

describe('NaturalSwissParsingDateAdapter', () => {
    let adapter: NaturalSwissParsingDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NaturalSwissParsingDateAdapter],
        });
        adapter = TestBed.inject(NaturalSwissParsingDateAdapter);
    });

    it('should be created', () => {
        expect(adapter).toBeTruthy();
    });

    it('should parse Swiss format', () => {
        expect(formatIsoDate(adapter.parse('22.11.2018'))).toBe('2018-11-22');
    });

    it('should parse with slash format', () => {
        expect(formatIsoDate(adapter.parse('22/11/2018'))).toBe('2018-11-22');
    });

    it('should parse with backslash format', () => {
        expect(formatIsoDate(adapter.parse('22\\11\\2018'))).toBe('2018-11-22');
    });

    it('should parse with dash format', () => {
        expect(formatIsoDate(adapter.parse('22-11-2018'))).toBe('2018-11-22');
    });

    it('should parse partial Swiss format', () => {
        expect(formatIsoDate(adapter.parse('2.1.18'))).toBe('2018-01-02');
    });

    it('should parse partial with dash format', () => {
        expect(formatIsoDate(adapter.parse('2-1-18'))).toBe('2018-01-02');
    });

    it('should parse ISO format', () => {
        expect(formatIsoDate(adapter.parse('2018-01-02'))).toBe('2018-01-02');
    });

    it('should tolerate whitespaces before and after', () => {
        expect(formatIsoDate(adapter.parse('  22.11.2018  '))).toBe('2018-11-22');
        expect(formatIsoDate(adapter.parse('  2018-01-02  '))).toBe('2018-01-02');
    });

    it('should return nothing at all for an empty field', () => {
        expect(adapter.parse('')).toBeNull();
        expect(adapter.parse('   ')).toBeNull();
        expect(adapter.parse(null)).toBeNull();
        expect(adapter.parse(undefined)).toBeNull();
    });

    it('should tell an empty field apart from a date still being typed', () => {
        expect(adapter.parse('')).toBeNull();

        const stillBeingTyped = adapter.parse('01.01.');
        expect(stillBeingTyped).not.toBeNull();
        expect(adapter.isValid(stillBeingTyped!)).toBeFalse();
    });

    it('should reject too much partial Swiss format', () => {
        expect(adapter.isValid(adapter.parse('2.1.1')!)).toBeFalse();
    });

    it('should reject mixed separators', () => {
        expect(adapter.isValid(adapter.parse('22.11/2018')!)).toBeFalse();
    });

    it('should reject no separator at all', () => {
        expect(adapter.isValid(adapter.parse('220905')!)).toBeFalse();
    });

    it('should parse the 29th of February of a leap year', () => {
        expect(formatIsoDate(adapter.parse('29.02.2024'))).toBe('2024-02-29');
    });

    it('should reject a day that does not exist in that month', () => {
        expect(adapter.isValid(adapter.parse('29.02.2026')!)).toBeFalse();
        expect(adapter.isValid(adapter.parse('31.02.2026')!)).toBeFalse();
        expect(adapter.isValid(adapter.parse('31.04.2026')!)).toBeFalse();
        expect(formatIsoDate(adapter.parse('30.04.2026'))).toBe('2026-04-30');
    });

    it('should reject invalid date', () => {
        expect(adapter.isValid(adapter.parse('00.01.2000')!)).toBeFalse();
        expect(adapter.isValid(adapter.parse('01.00.2000')!)).toBeFalse();
        expect(adapter.isValid(adapter.parse('01.31.2000')!)).toBeFalse();
        expect(adapter.isValid(adapter.parse('50.01.2000')!)).toBeFalse();
    });
});
