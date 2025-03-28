import {Source} from './source';

/**
 * Return custom image URL as avatar
 */
export class Image extends Source {
    public getAvatar(): Promise<string> {
        return Promise.resolve(this.getValue());
    }

    public isTextual(): boolean {
        return false;
    }
}
