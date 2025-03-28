import {hmacSha256, sha256} from './crypto';

describe('sha256', () => {
    it('should hash', async () => {
        expect(await sha256('foo')).toBe('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
        expect(await sha256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
        expect(await sha256('räksmörgås')).toBe('9992a572307e11690b104db56e7689efcddd251a363b1588209fb907f27afa31');
        expect(await sha256('\u30b9\u3092\u98df')).toBe(
            '064503b125856197b95ac886885ceedd770ad888b1b6f388943cc8d877474ab9',
        );
    });
});

describe('hmacSha256', () => {
    it('should HMAC SHA256', async () => {
        expect(await hmacSha256('my secret key here', 'my message content that will be signed here')).toBe(
            '2e6ba49ec8a60ac0eea472f7f0ffc22ccbed921a0f13b57d54f7e78652de4b8f',
        );

        expect(await hmacSha256('asd', 'adsklamdouqbwrufndms')).toBe(
            '3ee157f7d6ca0393cfe4fbdfb24b2a04bc32056f5328853e56cf94ac9b426d1c',
        );

        expect(await hmacSha256('016C0437', 'my example payload')).toBe(
            '66f4697dac9bb98c922a7a9d51393afb49095e4a29d937e5727e4cc16f3fde4e',
        );
    });
});
