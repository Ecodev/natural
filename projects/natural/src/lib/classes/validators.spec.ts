import {
    available,
    decimal,
    deliverableEmail,
    greaterThan,
    integer,
    nfcCardHex,
    signedMoney,
    time,
    unique,
    unsignedMoney,
    url,
    type ValidationErrorsWithMessage,
} from '@ecodev/natural';
import {
    type AsyncValidatorFn,
    FormControl,
    type FormControlStatus,
    type ValidationErrors,
    type ValidatorFn,
} from '@angular/forms';
import {concat, EMPTY, first, forkJoin, NEVER, type Observable, of, Subject, tap} from 'rxjs';
import {type UntypedModelService} from '../types/types';

function messageToString(
    errors: ValidationErrors | ValidationErrorsWithMessage | null,
): ValidationErrors | ValidationErrorsWithMessage | null {
    for (const value of Object.values(errors ?? {})) {
        if (typeof value.message === 'function') {
            value.message = value.message('');
        }
    }

    return errors;
}

function validate(
    validatorFn: ValidatorFn,
    value: unknown,
    expected: ValidationErrors | ValidationErrorsWithMessage | null,
): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    const expectValid = expected === null;
    expect(control.valid)
        .withContext(JSON.stringify(value) + ' should be ' + (expectValid ? 'valid' : 'invalid'))
        .toBe(expectValid);
    const errors = messageToString(control.errors);
    expect(errors).withContext(JSON.stringify(value)).toEqual(expected);
}

function asyncValidate(
    done: DoneFn,
    validatorFn: AsyncValidatorFn,
    value: unknown,
    expected: ValidationErrors | ValidationErrorsWithMessage | null,
): void {
    const control = new FormControl();
    control.markAsDirty();
    control.setValue(value);

    const validatorCompleted$ = new Subject<void>();

    forkJoin({
        internalCompleted: validatorCompleted$, // wait for internal validator to be completed
        status: control.statusChanges.pipe(first()), // Wait for at least 1 status change
    }).subscribe({
        next: () => {
            const expectedStatus: FormControlStatus = expected === null ? 'VALID' : 'INVALID';
            expect(control.status)
                .withContext(JSON.stringify(value) + ' should be ' + expectedStatus)
                .toBe(expectedStatus);
            const errors = messageToString(control.errors);
            expect(errors).withContext(JSON.stringify(value)).toEqual(expected);
        },
        complete: done,
    });

    const validator$ = (validatorFn(control) as Observable<ValidationErrors | null>).pipe(
        tap({
            complete: () => {
                validatorCompleted$.next();
                validatorCompleted$.complete();
            },
        }),
    );

    control.setAsyncValidators(() => validator$);
    control.updateValueAndValidity();
}

describe('available', () => {
    const error = {
        available: {
            message: `N'est pas disponible`,
        },
    };

    const cases: [string, string | null, boolean, ValidationErrorsWithMessage | null][] = [
        ['my-value', null, true, null],
        ['my-value', 'my-excluded-id', true, null],
        ['my-value', null, false, error],
        ['', null, false, null],
    ];

    cases.forEach(parameters => {
        it('with ' + JSON.stringify(parameters), done => {
            const validator = available((value, excludedId) => {
                expect(value).toBe(parameters[0]);
                expect(excludedId).toBe(parameters[1]);

                return of(parameters[2]);
            }, parameters[1]);

            asyncValidate(done, validator, parameters[0], parameters[3]);
        });
    });
});

describe('unique', () => {
    const error = {
        duplicateValue: {
            count: 1,
            message: `N'est pas unique`,
        },
    };

    const cases: [string, number, boolean, ValidationErrorsWithMessage | null][] = [
        ['my-value', 0, true, null],
        ['my-value', 0, false, null],
        ['my-value', 1, true, error],
        ['my-value', 1, false, error],
        ['', 0, true, null],
        ['', 0, false, null],
        ['', 1, true, null],
        ['', 1, false, null],
    ];

    cases.forEach(parameters => {
        it('with ' + JSON.stringify(parameters), done => {
            const service = jasmine.createSpyObj<UntypedModelService>('NaturalAbstractModelService', ['count']);
            service.count.and.returnValue(concat(of(parameters[1]), parameters[2] ? EMPTY : NEVER));

            const validator = unique('id', null, service);

            asyncValidate(done, validator, parameters[0], parameters[3]);
        });
    });
});

describe('deliverableEmail', () => {
    it('should validate email with known TLD', () => {
        const error: ValidationErrorsWithMessage = {
            deliverableEmail: {message: `Adresse email invalide`},
        };

        validate(deliverableEmail, 'john@example.com', null);
        validate(deliverableEmail, 'josé@example.com', error);
        validate(deliverableEmail, 'john@example.non-existing-tld', error);
        validate(deliverableEmail, 'root@localhost', error);
        validate(deliverableEmail, 'root@127.0.0.1', error);
        validate(deliverableEmail, 'xyz.qze@qwer..net', error); // consecutive dots are invalid
        validate(deliverableEmail, '', null);
        validate(deliverableEmail, null, null);

        // Valid https://en.wikipedia.org/wiki/Email_address#Examples
        validate(deliverableEmail, 'simple@example.com', null);
        validate(deliverableEmail, 'very.common@example.com', null);
        validate(deliverableEmail, 'disposable.style.email.with+symbol@example.com', null);
        validate(deliverableEmail, 'other.email-with-hyphen@example.com', null);
        validate(deliverableEmail, 'fully-qualified-domain@example.com', null);

        // may go to user.name@example.com inbox depending on mail server)
        validate(deliverableEmail, 'user.name+tag+sorting@example.com', null);
        validate(deliverableEmail, 'x@example.com', null); // one-letter local-part)
        validate(deliverableEmail, 'example-indeed@strange-example.com', null);

        // local domain name are specifically rejected (against RFC)
        validate(deliverableEmail, 'admin@mailserver1', error);

        // example TLD are specifically rejected (against RFC)
        validate(deliverableEmail, 'example@s.example', error);

        validate(deliverableEmail, '" "@example.org', error); // space between the quotes (against RFC)
        validate(deliverableEmail, '"john..doe"@example.org', error); // quoted double dot (against RFC)
        validate(deliverableEmail, 'mailhost!username@example.org', null); // bangified host route used for uucp mailers)
        validate(deliverableEmail, 'user%example.com@example.org', null); // % escaped mail route to user@example.com via example.org

        // https://en.wikipedia.org/wiki/Email_address#Internationalization (corrected for existing TLDs)
        validate(deliverableEmail, 'Pelé@example.com', error);
        validate(deliverableEmail, '삼성@삼성.삼성', error);
        validate(deliverableEmail, 'δοκιμή@παράδειγμα.бг', error);
        validate(deliverableEmail, '我買@屋企.香格里拉', error);
        validate(deliverableEmail, '二ノ宮@黒川.ストア', error);
        validate(deliverableEmail, 'медведь@с-балалайкой.онлайн', error);
        validate(deliverableEmail, 'संपर्क@डाटामेल.भारतम्', error);

        // Invalid https://en.wikipedia.org/wiki/Email_address#Examples
        validate(deliverableEmail, 'Abc.example.com', error); // no @ character
        validate(deliverableEmail, 'A@b@c@example.com', error); // only one @ is allowed outside quotation marks
        // none of the special characters in this local-part are allowed outside quotation marks
        validate(deliverableEmail, 'a"b(c)d,e:f;g<h>i[j\\k]l@example.com', error);
        // quoted strings must be dot separated or the only element making up the local-part
        validate(deliverableEmail, 'just"not"right@example.com', error);
        // spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash
        validate(deliverableEmail, 'this is"not\\allowed@example.com', error);
        // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
        validate(deliverableEmail, 'this\\ still\\"not\\\\allowed@example.com', error);

        // we don't care about length of individual parts (against RFC)
        validate(
            deliverableEmail,
            '1234567890123456789012345678901234567890123456789012345678901234+x@example.com',
            null,
        ); // local part is longer than 64 characters)

        // we care about length of entire address (against RFC ?)
        validate(deliverableEmail, 'a'.repeat(254) + '@example.com', error); // entire address is too long

        // space in domain name is a surprisingly common typo, so we forbid it
        validate(deliverableEmail, 'john@ example.com', error);
    });
});

describe('url', () => {
    it('should validates URL', () => {
        const error: ValidationErrorsWithMessage = {
            url: {
                message: `URL invalide`,
            },
        };

        validate(url, 'http://www.example.com', null);
        validate(url, 'https://www.example.com', null);
        validate(url, 'http://example.com', null);
        validate(url, 'http://www.example.com/path', null);
        validate(url, 'http://www.example.com/path#frag', null);
        validate(url, 'http://www.example.com/path?param=1', null);
        validate(url, 'http://www.example.com/path?param=1#fra', null);
        validate(url, 'http://t.co', null);
        validate(url, 'http://www.t.co', null);
        validate(url, 'http://a-b.c.t.co', null);
        validate(url, 'http://aa.com', null);
        validate(url, 'http://www.example', null); // this is indeed valid because `example` could be a TLD
        validate(url, 'https://example.com:4200/subscribe', null);
        validate(url, 'https://example-.com', null); // this is not conform to rfc1738, but we tolerate it for simplicity sake

        validate(url, 'www.example.com', error);
        validate(url, 'example.com', error);
        validate(url, 'www.example', error);
        validate(url, 'http://example', error);
        validate(url, 'www.example#.com', error);
        validate(url, 'www.t.co', error);
        validate(url, 'file:///C:/folder/file.pdf', error);
    });
});

describe('integer', () => {
    it('should validates integer number', () => {
        const error: ValidationErrorsWithMessage = {
            integer: {
                message: `Doit être un nombre entier`,
            },
        };

        validate(integer, null, null);
        validate(integer, undefined, null);
        validate(integer, '', null);
        validate(integer, '0', null);
        validate(integer, '-1', null);
        validate(integer, '1', null);
        validate(integer, '1234567890', null);
        validate(integer, '-1.0', null);
        validate(integer, '1.0', null);
        validate(integer, '0.0', null);
        validate(integer, 0, null);
        validate(integer, -1, null);
        validate(integer, 1, null);
        validate(integer, 1234567890, null);
        validate(integer, -1.0, null);
        validate(integer, 1.0, null);
        validate(integer, 0.0, null);

        validate(integer, 'foo', error);
        validate(integer, '1.2', error);
        validate(integer, '-1.2', error);
        validate(integer, 1.2, error);
        validate(integer, -1.2, error);
    });
});

describe('decimal', () => {
    describe('with 0 digits', () => {
        it('should validates decimal number', () => {
            const error: ValidationErrorsWithMessage = {
                decimal: {
                    scale: 0,
                    message: `Maximum de 0 décimales`,
                },
            };

            const validator = decimal(0);
            validate(validator, null, null);
            validate(validator, undefined, null);
            validate(validator, 'foo', error);
            validate(validator, '', null);
            validate(validator, '0', null);
            validate(validator, '0.', null);
            validate(validator, '1', null);
            validate(validator, '1.', null);
            validate(validator, '-0', null);
            validate(validator, '-1', null);
            validate(validator, '-0.0', error);
            validate(validator, '-1.1', error);
            validate(validator, '-1w1', error);
            validate(validator, '1w1', error);
            validate(validator, '-1w', error);
            validate(validator, '1w', error);
            validate(validator, 0, null);
            validate(validator, 1, null);
            validate(validator, -0, null);
            validate(validator, -1, null);
            validate(validator, -0.0, null);
            validate(validator, -1.1, error);
        });
    });

    describe('with 3 digits', () => {
        it('should validates decimal number', () => {
            const error: ValidationErrorsWithMessage = {
                decimal: {
                    scale: 3,
                    message: `Maximum de 3 décimales`,
                },
            };

            const validator = decimal(3);
            validate(validator, null, null);
            validate(validator, undefined, null);
            validate(validator, 'foo', error);
            validate(validator, '', null);
            validate(validator, '0', null);
            validate(validator, '0.', null);
            validate(validator, '1', null);
            validate(validator, '1.', null);
            validate(validator, '1.1', null);
            validate(validator, '1.12', null);
            validate(validator, '1.123', null);
            validate(validator, '1w123', error);
            validate(validator, '1.1234', error);
            validate(validator, '-0', null);
            validate(validator, '-1', null);
            validate(validator, '-0.0', null);
            validate(validator, '-1.1', null);
            validate(validator, '-1.12', null);
            validate(validator, '-1w12', error);
            validate(validator, '-1.1234', error);
            validate(validator, 0, null);
            validate(validator, 1, null);
            validate(validator, 1.1, null);
            validate(validator, 1.12, null);
            validate(validator, 1.123, null);
            validate(validator, 1.1234, error);
            validate(validator, -0, null);
            validate(validator, -1, null);
            validate(validator, -0.0, null);
            validate(validator, -1.1, null);
            validate(validator, -1.12, null);
            validate(validator, -1.1234, error);
        });
    });
});

describe('signedMoney', () => {
    it('should allow negative and positive amounts within the human limit', () => {
        const error: ValidationErrorsWithMessage = {
            money: {
                message: `Le montant doit être un nombre avec un maximum de deux décimales`,
            },
        };

        const validator = signedMoney;
        validate(validator, null, null);
        validate(validator, undefined, null);
        validate(validator, '', null);
        validate(validator, '0', null);
        validate(validator, '100', null);
        validate(validator, '100.00', null);
        validate(validator, '-100', null);
        validate(validator, '99.99', null);
        validate(validator, '-99.99', null);
        validate(validator, '1.234', error); // too many decimals
        validate(validator, 'foo', error);
        validate(validator, '-5000000', null);
        validate(validator, '5000000', null);
        validate(validator, '-5000000.01', {min: {min: -5000000, actual: '-5000000.01'}});
        validate(validator, '5000000.01', {max: {max: 5000000, actual: '5000000.01'}});
    });
});

describe('unsignedMoney', () => {
    it('should only allow positive amounts within the human limit', () => {
        const error: ValidationErrorsWithMessage = {
            money: {
                message: `Le montant doit être un nombre avec un maximum de deux décimales`,
            },
        };

        const validator = unsignedMoney;
        validate(validator, null, null);
        validate(validator, undefined, null);
        validate(validator, '', null);
        validate(validator, '0', null);
        validate(validator, '100', null);
        validate(validator, '100.00', null);
        validate(validator, '99.99', null);
        validate(validator, '1.234', error); // too many decimals
        validate(validator, 'foo', error);
        validate(validator, '0', null);
        validate(validator, '5000000', null);
        validate(validator, '-0.01', {min: {min: 0, actual: '-0.01'}});
        validate(validator, '5000000.01', {max: {max: 5000000, actual: '5000000.01'}});
    });
});

describe('greaterThan', () => {
    it('should validates greaterThan number', () => {
        const validator = greaterThan(2);
        validate(validator, null, null);
        validate(validator, undefined, null);
        validate(validator, 'foo', null);
        validate(validator, '', null);
        validate(validator, '1', {
            greaterThan: {
                greaterThan: 2,
                actual: '1',
                message: `Doit être plus grand que 2`,
            },
        });
        validate(validator, '2', {
            greaterThan: {
                greaterThan: 2,
                actual: '2',
                message: `Doit être plus grand que 2`,
            },
        });
        validate(validator, '2.0001', null);
        validate(validator, 1, {
            greaterThan: {
                greaterThan: 2,
                actual: 1,
                message: `Doit être plus grand que 2`,
            },
        });
        validate(validator, 2, {
            greaterThan: {
                greaterThan: 2,
                actual: 2,
                message: `Doit être plus grand que 2`,
            },
        });
        validate(validator, 2.0001, null);
    });
});

describe('nfcCard hex CSN', () => {
    const error: ValidationErrorsWithMessage = {
        nfcCardHex: {
            message: `Doit être au format hexadécimal (A1:B2:C3:D4 ou A1B2C3D4)`,
        },
    };

    it('should validate 32 bits hex with delimiters', () => {
        validate(nfcCardHex, '13:43:A1:16', null);
    });

    it('should validate compact 32 bits hex', () => {
        validate(nfcCardHex, '1343A116', null);
    });

    it('should not validate 16 bits CSN', () => {
        validate(nfcCardHex, '13:43', error);
    });

    it('should not validate integer', () => {
        validate(nfcCardHex, '323199254', error);
    });
    it('should not validate CSN with invalid characters', () => {
        validate(nfcCardHex, '13Z1C8L4', error);
    });
});

describe('time', () => {
    it('should validate', () => {
        const error: ValidationErrorsWithMessage = {
            time: {
                message: `L'heure doit être au format "14h35", "14:35" ou "14h".`,
            },
        };

        validate(time, '', null); // this should be invalidated via `required` validator
        validate(time, '14:30', null);
        validate(time, '14h30', null);
        validate(time, '  14h30  ', null);
        validate(time, '14h', null);
        validate(time, '14:', null);
        validate(time, '9', null);
        validate(time, 'a', error);
        validate(time, '114h30', error);
        validate(time, '99h00', error);
        validate(time, '00h99', error);
    });
});
