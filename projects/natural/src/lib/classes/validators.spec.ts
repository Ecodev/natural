import {
    available,
    decimal,
    deliverableEmail,
    greaterThan,
    ifValid,
    integer,
    nfcCardHex,
    time,
    unique,
    url,
} from '@ecodev/natural';
import {
    AsyncValidatorFn,
    FormControl,
    FormControlStatus,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import {TestScheduler} from 'rxjs/testing';
import {concat, forkJoin, NEVER, Observable, of, Subject, tap} from 'rxjs';
import {first} from 'rxjs/operators';
import {UntypedModelService} from '../types/types';

function validate(validatorFn: ValidatorFn, expected: boolean, value: any): void {
    const control = new FormControl();
    control.setValidators(validatorFn);
    control.setValue(value);
    expect(control.valid)
        .withContext(JSON.stringify(value) + ' should be ' + (expected ? 'valid' : 'invalid'))
        .toBe(expected);
}

function asyncValidate(validatorFn: AsyncValidatorFn, expected: FormControlStatus, value: any, done: DoneFn): void {
    const control = new FormControl();
    control.markAsDirty();
    control.setValue(value);

    const validatorCompleted$ = new Subject<void>();

    forkJoin({
        internalCompleted: validatorCompleted$, // wait for internal validator to be completed
        status: control.statusChanges.pipe(first()), // Wait for at least 1 status change
    }).subscribe({
        next: () => {
            expect(control.status)
                .withContext(JSON.stringify(value) + ' should be ' + expected)
                .toBe(expected);
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
    const cases: [string, string | null, boolean, FormControlStatus][] = [
        ['my-value', null, true, 'VALID'],
        ['my-value', 'my-excluded-id', true, 'VALID'],
        ['my-value', null, false, 'INVALID'],
        ['', null, false, 'VALID'],
    ];

    cases.forEach(parameters => {
        it('with ' + JSON.stringify(parameters), done => {
            const validator = available((value, excludedId) => {
                expect(value).toBe(parameters[0]);
                expect(excludedId).toBe(parameters[1]);

                return of(parameters[2]);
            }, parameters[1]);

            asyncValidate(validator, parameters[3], parameters[0], done);
        });
    });
});

describe('unique', () => {
    const cases: [string, number, boolean, FormControlStatus][] = [
        ['my-value', 0, true, 'VALID'],
        ['my-value', 0, false, 'VALID'],
        ['my-value', 1, true, 'INVALID'],
        ['my-value', 1, false, 'INVALID'],
        ['', 0, true, 'VALID'],
        ['', 0, false, 'VALID'],
        ['', 1, true, 'VALID'],
        ['', 1, false, 'VALID'],
    ];

    cases.forEach(parameters => {
        it('with ' + JSON.stringify(parameters), done => {
            const service = jasmine.createSpyObj<UntypedModelService>('NaturalAbstractModelService', ['count']);
            service.count.and.returnValue(concat(of(parameters[1]), parameters[2] ? NEVER : NEVER));

            const validator = unique('id', null, service);

            asyncValidate(validator, parameters[3], parameters[0], done);
        });
    });
});

describe('deliverableEmail', () => {
    it('should validate email with known TLD', () => {
        validate(deliverableEmail, true, 'john@example.com');
        validate(deliverableEmail, false, 'josé@example.com');
        validate(deliverableEmail, false, 'john@example.non-existing-tld');
        validate(deliverableEmail, false, 'root@localhost');
        validate(deliverableEmail, false, 'root@127.0.0.1');
        validate(deliverableEmail, true, '');
        validate(deliverableEmail, true, null);

        // Valid https://en.wikipedia.org/wiki/Email_address#Examples
        validate(deliverableEmail, true, 'simple@example.com');
        validate(deliverableEmail, true, 'very.common@example.com');
        validate(deliverableEmail, true, 'disposable.style.email.with+symbol@example.com');
        validate(deliverableEmail, true, 'other.email-with-hyphen@example.com');
        validate(deliverableEmail, true, 'fully-qualified-domain@example.com');

        // may go to user.name@example.com inbox depending on mail server)
        validate(deliverableEmail, true, 'user.name+tag+sorting@example.com');
        validate(deliverableEmail, true, 'x@example.com'); // one-letter local-part)
        validate(deliverableEmail, true, 'example-indeed@strange-example.com');

        // local domain name are specifically rejected (against RFC)
        validate(deliverableEmail, false, 'admin@mailserver1');

        // example TLD are specifically rejected (against RFC)
        validate(deliverableEmail, false, 'example@s.example');

        validate(deliverableEmail, false, '" "@example.org'); // space between the quotes (against RFC)
        validate(deliverableEmail, false, '"john..doe"@example.org'); // quoted double dot (against RFC)
        validate(deliverableEmail, true, 'mailhost!username@example.org'); // bangified host route used for uucp mailers)
        validate(deliverableEmail, true, 'user%example.com@example.org'); // % escaped mail route to user@example.com via example.org

        // https://en.wikipedia.org/wiki/Email_address#Internationalization (corrected for existing TLDs)
        validate(deliverableEmail, false, 'Pelé@example.com');
        validate(deliverableEmail, false, '삼성@삼성.삼성');
        validate(deliverableEmail, false, 'δοκιμή@παράδειγμα.бг');
        validate(deliverableEmail, false, '我買@屋企.香格里拉');
        validate(deliverableEmail, false, '二ノ宮@黒川.ストア');
        validate(deliverableEmail, false, 'медведь@с-балалайкой.онлайн');
        validate(deliverableEmail, false, 'संपर्क@डाटामेल.भारतम्');

        // Invalid https://en.wikipedia.org/wiki/Email_address#Examples
        validate(deliverableEmail, false, 'Abc.example.com'); // no @ character
        validate(deliverableEmail, false, 'A@b@c@example.com'); // only one @ is allowed outside quotation marks
        // none of the special characters in this local-part are allowed outside quotation marks
        validate(deliverableEmail, false, 'a"b(c)d,e:f;g<h>i[j\\k]l@example.com');
        // quoted strings must be dot separated or the only element making up the local-part
        validate(deliverableEmail, false, 'just"not"right@example.com');
        // spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash
        validate(deliverableEmail, false, 'this is"not\\allowed@example.com');
        // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
        validate(deliverableEmail, false, 'this\\ still\\"not\\\\allowed@example.com');

        // we don't care about length of individual parts (against RFC)
        validate(
            deliverableEmail,
            true,
            '1234567890123456789012345678901234567890123456789012345678901234+x@example.com',
        ); // local part is longer than 64 characters)

        // we care about length of entire address (against RFC ?)
        validate(deliverableEmail, false, 'a'.repeat(254) + '@example.com'); // entire address is too long

        // space in domain name is a surprisingly common typo, so we forbid it
        validate(deliverableEmail, false, 'john@ example.com');
    });
});

describe('url', () => {
    it('should validates URL', () => {
        validate(url, true, 'http://www.example.com');
        validate(url, true, 'https://www.example.com');
        validate(url, true, 'http://example.com');
        validate(url, true, 'http://www.example.com/path');
        validate(url, true, 'http://www.example.com/path#frag');
        validate(url, true, 'http://www.example.com/path?param=1');
        validate(url, true, 'http://www.example.com/path?param=1#fra');
        validate(url, true, 'http://t.co');
        validate(url, true, 'http://www.t.co');
        validate(url, true, 'http://a-b.c.t.co');
        validate(url, true, 'http://aa.com');
        validate(url, true, 'http://www.example'); // this is indeed valid because `example` could be a TLD
        validate(url, true, 'https://example.com:4200/subscribe');
        validate(url, true, 'https://example-.com'); // this is not conform to rfc1738, but we tolerate it for simplicity sake

        validate(url, false, 'www.example.com');
        validate(url, false, 'example.com');
        validate(url, false, 'www.example');
        validate(url, false, 'http://example');
        validate(url, false, 'www.example#.com');
        validate(url, false, 'www.t.co');
        validate(url, false, 'file:///C:/folder/file.pdf');
    });
});

describe('integer', () => {
    it('should validates integer number', () => {
        validate(integer, true, null);
        validate(integer, true, undefined);
        validate(integer, true, '');
        validate(integer, true, '0');
        validate(integer, true, '-1');
        validate(integer, true, '1');
        validate(integer, true, '1234567890');
        validate(integer, true, '-1.0');
        validate(integer, true, '1.0');
        validate(integer, true, '0.0');
        validate(integer, true, 0);
        validate(integer, true, -1);
        validate(integer, true, 1);
        validate(integer, true, 1234567890);
        validate(integer, true, -1.0);
        validate(integer, true, 1.0);
        validate(integer, true, 0.0);

        validate(integer, false, 'foo');
        validate(integer, false, '1.2');
        validate(integer, false, '-1.2');
        validate(integer, false, 1.2);
        validate(integer, false, -1.2);
    });
});

describe('decimal', () => {
    describe('with 0 digits', () => {
        it('should validates decimal number', () => {
            const validator = decimal(0);
            validate(validator, true, null);
            validate(validator, true, undefined);
            validate(validator, false, 'foo');
            validate(validator, true, '');
            validate(validator, true, '0');
            validate(validator, true, '0.');
            validate(validator, true, '1');
            validate(validator, true, '1.');
            validate(validator, true, '-0');
            validate(validator, true, '-1');
            validate(validator, false, '-0.0');
            validate(validator, false, '-1.1');
            validate(validator, false, '-1w1');
            validate(validator, false, '1w1');
            validate(validator, false, '-1w');
            validate(validator, false, '1w');
            validate(validator, true, 0);
            validate(validator, true, 1);
            validate(validator, true, -0);
            validate(validator, true, -1);
            validate(validator, true, -0.0);
            validate(validator, false, -1.1);
        });
    });

    describe('with 3 digits', () => {
        it('should validates decimal number', () => {
            const validator = decimal(3);
            validate(validator, true, null);
            validate(validator, true, undefined);
            validate(validator, false, 'foo');
            validate(validator, true, '');
            validate(validator, true, '0');
            validate(validator, true, '0.');
            validate(validator, true, '1');
            validate(validator, true, '1.');
            validate(validator, true, '1.1');
            validate(validator, true, '1.12');
            validate(validator, true, '1.123');
            validate(validator, false, '1w123');
            validate(validator, false, '1.1234');
            validate(validator, true, '-0');
            validate(validator, true, '-1');
            validate(validator, true, '-0.0');
            validate(validator, true, '-1.1');
            validate(validator, true, '-1.12');
            validate(validator, false, '-1w12');
            validate(validator, false, '-1.1234');
            validate(validator, true, 0);
            validate(validator, true, 1);
            validate(validator, true, 1.1);
            validate(validator, true, 1.12);
            validate(validator, true, 1.123);
            validate(validator, false, 1.1234);
            validate(validator, true, -0);
            validate(validator, true, -1);
            validate(validator, true, -0.0);
            validate(validator, true, -1.1);
            validate(validator, true, -1.12);
            validate(validator, false, -1.1234);
        });
    });
});

describe('greaterThan', () => {
    it('should validates greaterThan number', () => {
        const validator = greaterThan(2);
        validate(validator, true, null);
        validate(validator, true, undefined);
        validate(validator, true, 'foo');
        validate(validator, true, '');
        validate(validator, false, '1');
        validate(validator, false, '2');
        validate(validator, true, '2.0001');
        validate(validator, false, 1);
        validate(validator, false, 2);
        validate(validator, true, 2.0001);
    });
});

describe('ifValid', () => {
    let scheduler: TestScheduler;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });
    });

    it('valid form should emit immediately', () => {
        scheduler.run(({expectObservable}) => {
            const control = new FormControl();
            expect(control.status).toBe('VALID');

            const actual = ifValid(control);
            expectObservable(actual).toBe('(a|)', {a: 'VALID'});
        });
    });

    it('invalid form should never emit', () => {
        scheduler.run(({expectObservable}) => {
            const control = new FormControl(null, Validators.required);
            expect(control.status).toBe('INVALID');

            const actual = ifValid(control);
            expectObservable(actual).toBe('|');
        });
    });

    it('valid form should emit after the async validation is completed', () => {
        scheduler.run(({expectObservable, cold}) => {
            const control = new FormControl<string | null>(null, null, () => {
                // Always valid after a while
                return cold('-(a|)', {a: null});
            });

            expect(control.status).toBe('PENDING');

            control.setValue('foo');
            expect(control.status).toBe('PENDING');

            const actual = ifValid(control);
            expectObservable(actual).toBe('-(a|)', {a: 'VALID'});
        });
    });

    it('invalid form should never emit, even after the async validation is completed', () => {
        scheduler.run(({expectObservable, cold}) => {
            const control = new FormControl<string | null>(null, null, c => {
                // Simulate error after a while if there is any value
                if (c.value) {
                    return cold('-(a|)', {a: {myError: 'some message'}});
                } else {
                    return cold('-(a|)', {a: null});
                }
            });

            expect(control.status).toBe('PENDING');

            control.setValue('foo');
            expect(control.status).toBe('PENDING');

            const actual = ifValid(control);
            expectObservable(actual).toBe('-|', {a: 'VALID'});
        });
    });
});

describe('nfcCard hex CSN', () => {
    it('should validate 32 bits hex with delimiters', () => {
        validate(nfcCardHex, true, '13:43:A1:16');
    });

    it('should validate compact 32 bits hex', () => {
        validate(nfcCardHex, true, '1343A116');
    });

    it('should not validate 16 bits CSN', () => {
        validate(nfcCardHex, false, '13:43');
    });

    it('should not validate integer', () => {
        validate(nfcCardHex, false, '323199254');
    });
    it('should not validate CSN with invalid characters', () => {
        validate(nfcCardHex, false, '13Z1C8L4');
    });
});

describe('time', () => {
    it('should validate', () => {
        validate(time, true, ''); // this should be invalidated via `required` validator
        validate(time, true, '14:30');
        validate(time, true, '14h30');
        validate(time, true, '  14h30  ');
        validate(time, true, '14h');
        validate(time, true, '14:');
        validate(time, true, '9');
        validate(time, false, 'a');
        validate(time, false, '114h30');
        validate(time, false, '99h00');
        validate(time, false, '00h99');
    });
});
