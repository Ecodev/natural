import {ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal} from '@angular/core';
import {Source} from '../sources/source';
import {AvatarService} from '../service/avatar.service';
import {CommonModule} from '@angular/common';

type Style = Partial<CSSStyleDeclaration>;

/**
 * Show an avatar from different sources
 */
@Component({
    selector: 'natural-avatar',
    imports: [CommonModule],
    template: `
        @let source = currentSource();
        <div class="avatar-container" [style.height.px]="size()" [style.width.px]="size()">
            @if (source && source?.isTextual()) {
                <div class="avatar-content" [class.natural-elevation]="decorated()" [ngStyle]="textualStyle()">
                    {{ textAvatar() | async }}
                </div>
            } @else if (source) {
                @if (imageAvatar() | async; as src) {
                    <img
                        class="avatar-content"
                        loading="lazy"
                        [src]="src"
                        [width]="size()"
                        [height]="size()"
                        [ngStyle]="imageStyle()"
                        (error)="tryNextSource()"
                    />
                }
            }
        </div>
    `,
    styles: `
        :host {
            display: block;

            &.decorated {
                position: relative;

                .avatar-container::before {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    border-radius: 50%;
                    background: linear-gradient(345deg, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, 0.33) 100%);
                    content: '';
                }

                .avatar-content {
                    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.6);
                }
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.height.px]': 'size()',
        '[style.width.px]': 'size()',
        '[class.decorated]': 'decorated()',
    },
})
export class NaturalAvatarComponent {
    private readonly avatarService = inject(AvatarService);

    public readonly image = input<string | null>();
    public readonly initials = input<string | null>();
    public readonly gravatar = input<string | null>();
    public readonly size = input(50);
    public readonly decorated = input(true);
    public readonly textSizeRatio = input(2.25);
    public readonly bgColor = input<string | undefined>();
    public readonly fgColor = input('#FFF');
    public readonly borderRadius = input('');
    public readonly textMaximumLength = input(2);

    private readonly sources = linkedSignal<{currentIndex: number; sources: Source[]}>(() => {
        const sources: Source[] = [];
        for (const [propName, creator] of this.avatarService.getCreators()) {
            const value = this[propName]();
            if (value) {
                sources.push(new creator(value));
            }
        }

        return {
            currentIndex: this.findNextNonFailingIndex(-1, sources),
            sources,
        };
    });

    protected readonly currentSource = computed<Source | undefined>(() => {
        const sources = this.sources();

        return sources.sources[sources.currentIndex];
    });

    protected readonly imageAvatar = computed(() => this.currentSource()?.getAvatar(this.size()));

    protected readonly textAvatar = computed(() => this.currentSource()?.getAvatar(this.textMaximumLength()));

    /**
     * Try to use the next available avatar source that has not already failed in the past
     */
    public tryNextSource(): void {
        const previousSource = this.currentSource();
        if (previousSource) {
            this.avatarService.markSourceAsFailed(previousSource);
        }

        const {currentIndex, sources} = this.sources();
        this.sources.set({
            currentIndex: this.findNextNonFailingIndex(currentIndex, sources),
            sources,
        });
    }

    private findNextNonFailingIndex(currentIndex: number, sources: Source[]): number {
        while (++currentIndex < sources.length) {
            const source = sources[currentIndex];
            if (source && !this.avatarService.sourceHasFailedBefore(source)) {
                return currentIndex;
            }
        }

        return currentIndex;
    }

    /**
     * Returns initials style
     */
    protected readonly textualStyle = computed<Style>(() => {
        const bgColor = this.bgColor();

        const backgroundColor = bgColor
            ? bgColor
            : this.avatarService.getRandomColor(this.currentSource()?.getValue() ?? '');

        return {
            textAlign: 'center',
            borderRadius: this.borderRadius() || '100%',
            textTransform: 'uppercase',
            color: this.fgColor(),
            backgroundColor: backgroundColor,
            font: Math.floor(this.size() / this.textSizeRatio()) + 'px Helvetica, Arial, sans-serif',
            lineHeight: this.size() + 'px',
            width: this.size() + 'px',
            height: this.size() + 'px',
        };
    });

    /**
     * Returns image style
     */
    protected readonly imageStyle = computed<Style>(() => {
        return {
            maxWidth: '100%',
            borderRadius: this.borderRadius() || '100%',
            width: this.size() + 'px',
            height: this.size() + 'px',
        };
    });
}
