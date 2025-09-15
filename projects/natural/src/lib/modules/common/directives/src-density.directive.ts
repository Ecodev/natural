import {Directive, effect, ElementRef, inject, input} from '@angular/core';

export function densities(src: string, forImageSet: boolean): string {
    const match = /^(.*\/)(\d+)$/.exec(src);
    const base = match?.[1];
    const size = +(match?.[2] ?? 0);

    if (!base || !size) {
        return '';
    }

    // This should cover most common densities according to https://www.mydevice.io/#tab1
    let result = [1, 1.5, 2, 3, 4]
        .map(density => {
            let url = `${base}${Math.round(size * density)}`;
            if (forImageSet) {
                url = `url("${url}")`;
            }

            return `${url} ${density}x`;
        })
        .join(', ');

    if (forImageSet) {
        result = `image-set(${result})`;
    }

    return result;
}

@Directive({
    selector: 'img[naturalSrcDensity]',
})
export class NaturalSrcDensityDirective {
    private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

    /**
     * Automatically apply image selection based on screen density.
     *
     * The given URL **MUST** be the normal density URL. And it **MUST** include
     * the size as last path segment. That size will automatically be changed
     * for other screen densities. That means that the server **MUST** be able to
     * serve an image of the given size.
     *
     * Usage:
     *
     * ```html
     * <img naturalSrcDensity="/api/image/123/200" />
     * ```
     *
     * Will generate something like:
     *
     * ```html
     * <img
     *     src="/api/image/123/200"
     *     srcset="/api/image/123/200, /api/image/123/300 1.5x, /api/image/123/400 2x, /api/image/123/600 3x, /api/image/123/800 4x"
     * />
     * ```
     *
     * See https://web.dev/codelab-density-descriptors/
     */
    public readonly naturalSrcDensity = input.required<string>();

    public constructor() {
        effect(() => {
            const src = this.naturalSrcDensity();
            if (!src) {
                return;
            }

            this.elementRef.nativeElement.src = src;
            this.elementRef.nativeElement.srcset = densities(src, false);
        });
    }
}
