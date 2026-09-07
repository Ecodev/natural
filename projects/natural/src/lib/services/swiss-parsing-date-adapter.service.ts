import {Service} from '@angular/core';
import {NativeDateAdapter} from '@angular/material/core';

const patterns: readonly RegExp[] = [
    /^(?<day>\d{1,2})\.(?<month>\d{1,2})\.(?<year>\d{4}|\d{2})$/,
    /^(?<day>\d{1,2})-(?<month>\d{1,2})-(?<year>\d{4}|\d{2})$/,
    /^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{4}|\d{2})$/,
    /^(?<day>\d{1,2})\\(?<month>\d{1,2})\\(?<year>\d{4}|\d{2})$/,
    // strict ISO format
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/,
];

@Service()
export class NaturalSwissParsingDateAdapter extends NativeDateAdapter {
    /**
     * Parse commonly accepted swiss format, such as:
     *
     * - 24.12.2018
     * - 1.4.18
     * - 2018-12-24
     *
     * An empty field is `null`, and text that cannot be read is an invalid date.
     */
    public override parse(value: unknown): Date | null {
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (typeof value !== 'string') {
            return null;
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        for (const pattern of patterns) {
            const m = trimmed.match(pattern);
            if (m?.groups) {
                const year = +m.groups.year;
                const month = +m.groups.month;
                const day = +m.groups.day;

                return this.createDateOrInvalid(year, month, day);
            }
        }

        return this.invalid();
    }

    private createDateOrInvalid(year: number, month: number, date: number): Date {
        // Assume year 2000 if only two digits
        if (year < 100) {
            year += 2000;
        }

        month = month - 1;
        if (month < 0 || month > 11 || date < 1 || date > 31) {
            return this.invalid();
        }

        // A day that does not exist overflows into the next month
        if (new Date(year, month, date).getMonth() !== month) {
            return this.invalid();
        }

        return this.createDate(year, month, date);
    }

    public override getFirstDayOfWeek(): number {
        // Always starts on Monday, even though it is not true for Canada, U.S., Mexico and many more
        // Also see https://github.com/tc39/ecma402/issues/6
        return 1;
    }
}
