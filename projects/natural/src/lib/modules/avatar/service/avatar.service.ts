import {Injectable} from '@angular/core';
import {Source, SourceCreator} from '../sources/source';
import {Gravatar} from '../sources/gravatar';
import {Initials} from '../sources/initials';
import {Image} from '../sources/image';
import {NaturalAvatarComponent} from '../component/avatar.component';

/**
 * Provides utilities methods related to Avatar component
 */
@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    /**
     * Ordered pairs of possible sources. First in the list is the highest priority.
     * And key must match one the input of AvatarComponent.
     */
    private readonly sourceCreators = new Map<keyof NaturalAvatarComponent, SourceCreator>([
        ['gravatar', Gravatar],
        ['image', Image],
        ['initials', Initials],
    ]);

    private readonly avatarColors = [
        '#e37900', // 2.99 fail https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=e37900
        '#e6b102', // 2.26 fail https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=c7ab00
        '#00bbbb', // 2.37 fail https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=00bbbb
        '#008cff', // 3.38 fail https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=008cff
        '#d9138c', // 4.51 pass https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=d901b8
        '#7321d1', // 4.28 fail https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=c800ff
        '#3b3b3b', // 11.2 pass https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=3b3b3b
    ];

    private readonly failedSources = new Map<string, Source>();

    public getRandomColor(avatarText: string): string {
        if (!avatarText) {
            return 'transparent';
        }
        const asciiCodeSum = this.calculateAsciiCode(avatarText);

        return this.avatarColors[asciiCodeSum % this.avatarColors.length];
    }

    public getCreators(): IterableIterator<[keyof NaturalAvatarComponent, SourceCreator]> {
        return this.sourceCreators.entries();
    }

    private getSourceKey(source: Source): string {
        return source.constructor.name + '-' + source.getValue();
    }

    public sourceHasFailedBefore(source: Source): boolean {
        return this.failedSources.has(this.getSourceKey(source));
    }

    public markSourceAsFailed(source: Source): void {
        this.failedSources.set(this.getSourceKey(source), source);
    }

    private calculateAsciiCode(value: string): number {
        return value
            .split('')
            .map(letter => letter.charCodeAt(0))
            .reduce((previous, current) => previous + current);
    }
}
