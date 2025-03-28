import {sha256} from './sha256';

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
