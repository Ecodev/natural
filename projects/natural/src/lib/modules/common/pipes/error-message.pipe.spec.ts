import {NaturalErrorMessagePipe, urlPattern} from '@ecodev/natural';
import {ValidationErrors} from '@angular/forms';

describe('NaturalErrorMessagePipe', () => {
    it('create an instance', () => {
        const pipe = new NaturalErrorMessagePipe();
        expect(pipe).toBeTruthy();
    });

    const cases: (
        | [ValidationErrors | null | undefined, string]
        | [ValidationErrors | null | undefined, string, string]
    )[] = [
        // Past
        [null, ''],
        [undefined, ''],
        [{required: true}, 'Requis'],
        [{min: {min: 5, actual: 123}}, 'Doit être plus grand ou égal à 5'],
        [{min: {min: 5, actual: 123}}, '%', 'Doit être plus grand ou égal à 5 %'],
        [{max: {max: 5, actual: 123}}, 'Doit être plus petit ou égal à 5'],
        [{max: {max: 5, actual: 123}}, '%', 'Doit être plus petit ou égal à 5 %'],
        [{email: true}, 'Adresse email invalide'],
        [{minlength: {requiredLength: 5, actualLength: 123}}, 'Minimum 5 caractères'],
        [{maxlength: {requiredLength: 5, actualLength: 123}}, 'Maximum 5 caractères'],
        [{pattern: {requiredPattern: 'qwe', actualValue: 123}}, ''], // Because unknown pattern
        [{pattern: {requiredPattern: urlPattern, actualValue: 123}}, 'URL invalide'], // Because well-known pattern
        [{duplicateValue: 5}, "N'est pas unique"],
        [{available: true}, "N'est pas disponible"],
        [{integer: true}, 'Doit être un nombre entier'],
        [{decimal: 4}, 'Maximum de 4 décimales'],
        [{money: true}, 'Le montant doit être un nombre avec un maximum de deux décimales'],
        [{iban: true}, 'IBAN invalide'],
        [{greaterThan: {greaterThan: 5, actualValue: 123}}, 'Doit être plus grand que 5'],
        [{greaterThan: {greaterThan: 5, actualValue: 123}}, '%', 'Doit être plus grand que 5 %'],
        [{notCity: true}, 'Veuillez choisir une ville de la liste'],
        [{time: 'mon message'}, 'mon message'],
        [{nfcCardHex: 'mon message'}, 'mon message'],
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
