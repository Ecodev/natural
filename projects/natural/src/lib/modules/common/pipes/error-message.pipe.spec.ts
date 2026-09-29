import {NaturalErrorMessagePipe} from '@ecodev/natural';

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

    const cases: [string, ...Parameters<NaturalErrorMessagePipe['transform']>][] = [
        ['', null],
        ['', undefined],
        ['Requis', {required: true}],
        ['Doit être plus grand ou égal à 5', {min: {min: 5, actual: 123}}],
        ['Doit être plus grand ou égal à 5 %', {min: {min: 5, actual: 123}}, '%'],
        ['Doit être plus petit ou égal à 5', {max: {max: 5, actual: 123}}],
        ['Doit être plus petit ou égal à 5 %', {max: {max: 5, actual: 123}}, '%'],
        ['Minimum 5 caractères', {minlength: {requiredLength: 5, actualLength: 123}}],
        ['Maximum 5 caractères', {maxlength: {requiredLength: 5, actualLength: 123}}],
        ['', {pattern: {requiredPattern: 'qwe', actualValue: 123}}], // Because unknown pattern
        ['mon message', {myValidator: {message: 'mon message'}}],
        ['first message', {first: {message: 'first message'}, second: {message: 'second message'}}],
        ['', {myValidator: {message: 123}}],
        [`my message`, {myValidator: {message: (unit: string) => `my message${unit}`}}],
        [`my message %`, {myValidator: {message: (unit: string) => `my message${unit}`}}, '%'],
        ['Date invalide', {matDatepickerParse: {text: '01.01.'}}],
        [
            'Ne doit pas être dans le passé',
            {
                matDatepickerMin: {
                    min: today,
                    actual: new Date('2000-01-01T15:00:00.000Z'),
                },
            },
        ],
        [
            'Doit être dans le futur',
            {
                matDatepickerMin: {
                    min: tomorrow,
                    actual: new Date('2000-01-01T15:00:00.000Z'),
                },
            },
        ],
        [
            'Doit être plus grand ou égal à 03.02.2001',
            {
                matDatepickerMin: {
                    min: new Date('2001-02-03T00:00:00.000Z'),
                    actual: new Date('2000-01-01T15:00:00.000Z'),
                },
            },
        ],
        [
            'Ne doit pas être dans le futur',
            {
                matDatepickerMax: {
                    max: today,
                    actual: new Date('2999-01-01T15:00:00.000Z'),
                },
            },
        ],
        [
            'Doit être dans le passé',
            {
                matDatepickerMax: {
                    max: yesterday,
                    actual: new Date('2999-01-01T15:00:00.000Z'),
                },
            },
        ],
        [
            'Doit être plus petit ou égal à 03.02.2001',
            {
                matDatepickerMax: {
                    max: new Date('2001-02-03T00:00:00.000Z'),
                    actual: new Date('2999-01-01T15:00:00.000Z'),
                },
            },
        ],
        [
            'Doit être plus grand que 50 %',
            {
                greaterThan: {
                    greaterThan: 0.5,
                    actual: 0,
                    message: `foo`,
                },
            },
            '%',
            true,
        ],
        [
            'Doit être plus grand ou égal à 50 %',
            {
                min: {
                    min: 0.5,
                    actual: 0,
                },
            },
            '%',
            true,
        ],
        [
            'Doit être plus petit ou égal à 50 %',
            {
                max: {
                    max: 0.5,
                    actual: 1,
                },
            },
            '%',
            true,
        ],
        [
            'Doit être un nombre entier',
            {
                decimal: {
                    scale: 1,
                    message: `foo`,
                },
            },
            '%',
            true,
        ],
        [
            'Doit être un nombre entier',
            {
                decimal: {
                    scale: 2,
                    message: `foo`,
                },
            },
            '%',
            true,
        ],
        [
            'Maximum de 1 décimales',
            {
                decimal: {
                    scale: 3,
                    message: `foo`,
                },
            },
            '%',
            true,
        ],
    ];

    cases.forEach(theCase => {
        it('with ' + JSON.stringify(theCase), () => {
            const pipe = new NaturalErrorMessagePipe();

            const [expected, ...parameters] = theCase;
            expect(pipe.transform(...parameters)).toBe(expected);
        });
    });
});
