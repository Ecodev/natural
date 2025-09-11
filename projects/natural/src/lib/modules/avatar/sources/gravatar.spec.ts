import {Gravatar, isRetina} from './gravatar';

describe('Gravatar', () => {
    const size = isRetina() ? 64 : 32;
    const cases: [string, string][] = [
        [
            'webmaster@ecodev.ch',
            `https://secure.gravatar.com/avatar/88122e16db0e26c4a3ddffd0844d852394649027a76524bd9f7baebf34689b96?s=${size}&d=404`,
        ],
        [
            'WEBMASTER@EcOdEv.Ch',
            `https://secure.gravatar.com/avatar/88122e16db0e26c4a3ddffd0844d852394649027a76524bd9f7baebf34689b96?s=${size}&d=404`,
        ],
        [
            '5fa7e880db8ff6741e0268ff52c22057',
            `https://secure.gravatar.com/avatar/5fa7e880db8ff6741e0268ff52c22057?s=${size}&d=404`,
        ],
        [
            '88122e16db0e26c4a3ddffd0844d852394649027a76524bd9f7baebf34689b96',
            `https://secure.gravatar.com/avatar/88122e16db0e26c4a3ddffd0844d852394649027a76524bd9f7baebf34689b96?s=${size}&d=404`,
        ],
    ];

    cases.forEach(([input, expected]) => {
        it(`should return gravatar for '${input}'`, async () => {
            const gravatar = new Gravatar(input);
            expect(await gravatar.getAvatar(32)).toBe(expected);
        });
    });
});
