import {NaturalErrorMessagePipe} from '@ecodev/natural';
import {type ValidationErrors} from '@angular/forms';

describe('NaturalErrorMessagePipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalErrorMessagePipe();
        expect(pipe).toBeTruthy();
    });

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const cases: (
        [ValidationErrors | null | undefined, string] | [ValidationErrors | null | undefined, string, string]
    )[] = [
        // Past
        [null, ''],
        [undefined, ''],
        [{required: true}, 'Requis'],
        [{min: {min: 5, actual: 123}}, 'Doit être plus grand ou égal à 5'],
        [{min: {min: 5, actual: 123}}, '%', 'Doit être plus grand ou égal à 5 %'],
        [{max: {max: 5, actual: 123}}, 'Doit être plus petit ou égal à 5'],
        [{max: {max: 5, actual: 123}}, '%', 'Doit être plus petit ou égal à 5 %'],
        [{minlength: {requiredLength: 5, actualLength: 123}}, 'Minimum 5 caractères'],
        [{maxlength: {requiredLength: 5, actualLength: 123}}, 'Maximum 5 caractères'],
        [{pattern: {requiredPattern: 'qwe', actualValue: 123}}, ''], // Because unknown pattern
        [{myValidator: {message: 'mon message'}}, 'mon message'],
        [{first: {message: 'first message'}, second: {message: 'second message'}}, 'first message'],
        [{myValidator: {message: 123}}, ''],
        [{myValidator: {message: (unit: string) => `my message${unit}`}}, `my message`],
        [{myValidator: {message: (unit: string) => `my message${unit}`}}, '%', `my message %`],
        [
            {
                matDatepickerMin: {
                    min: today,
                    actual: new Date('2000-01-01T15:00:00.000Z'),
                },
            },
            'Ne doit pas être dans le passé',
        ],
        [
            {
                matDatepickerMin: {
                    min: tomorrow,
                    actual: new Date('2000-01-01T15:00:00.000Z'),
                },
            },
            'Doit être dans le futur',
        ],
        [
            {
                matDatepickerMin: {
                    min: new Date('2001-02-03T00:00:00.000Z'),
                    actual: new Date('2000-01-01T15:00:00.000Z'),
                },
            },
            'Doit être plus grand ou égal à 03.02.2001',
        ],
        [
            {
                matDatepickerMax: {
                    max: today,
                    actual: new Date('2999-01-01T15:00:00.000Z'),
                },
            },
            'Ne doit pas être dans le futur',
        ],
        [
            {
                matDatepickerMax: {
                    max: yesterday,
                    actual: new Date('2999-01-01T15:00:00.000Z'),
                },
            },
            'Doit être dans le passé',
        ],
        [
            {
                matDatepickerMax: {
                    max: new Date('2001-02-03T00:00:00.000Z'),
                    actual: new Date('2999-01-01T15:00:00.000Z'),
                },
            },
            'Doit être plus petit ou égal à 03.02.2001',
        ],
    ];

    cases.forEach(parameters => {
        it('with ' + JSON.stringify(parameters), () => {
            const pipe = new NaturalErrorMessagePipe();
            const unit = parameters.length === 2 ? undefined : parameters[1];
            const expected = parameters.length === 2 ? parameters[1] : parameters[2];
            expect(pipe.transform(parameters[0], unit)).toBe(expected);
        });
    });
});
