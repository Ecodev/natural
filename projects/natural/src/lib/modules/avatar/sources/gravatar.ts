import {Source} from './source';
import {sha256} from '../service/sha256';

function isRetina(): boolean {
    // We cannot reasonably inject `DOCUMENT` here, but we are extra
    // careful about usage of `window` and its possible non-existence in SSR,
    // so we should be fine.
    // eslint-disable-next-line no-restricted-globals
    const myWindow: Window | undefined = window;

    if (myWindow?.devicePixelRatio > 1.25) {
        return true;
    }

    const mediaQuery =
        '(-webkit-min-device-pixel-ratio: 1.25), (min--moz-device-pixel-ratio: 1.25), (-o-min-device-pixel-ratio: 5/4), (min-resolution: 1.25dppx)';

    return !!myWindow?.matchMedia(mediaQuery).matches;
}

/**
 * Return URL to Gravatar image from either an email or a MD5 or SHA-256 of an email
 */
export class Gravatar extends Source {
    public async getAvatar(size: number): Promise<string> {
        const value = this.getValue();
        const hash = /^([a-f0-9]{32}|[a-f0-9]{64})$/.exec(value) ? value : await sha256(value.trim().toLowerCase());

        const avatarSize = isRetina() ? size * 2 : size;
        return `https://secure.gravatar.com/avatar/${hash}?s=${avatarSize}&d=404`;
    }

    public isTextual(): boolean {
        return false;
    }
}
