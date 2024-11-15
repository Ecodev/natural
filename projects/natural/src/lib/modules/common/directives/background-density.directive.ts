import {Directive, ElementRef, inject, Input} from '@angular/core';
import {densities} from './src-density.directive';

@Directive({
    selector: '[naturalBackgroundDensity]',
    standalone: true,
})
export class NaturalBackgroundDensityDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Automatically apply background image selection based on screen density.
     *
     * The given URL **MUST** be the normal density URL. And it **MUST** include
     * the size as last path segment. That size will automatically be changed
     * for other screen densities. That means that the server **MUST** be able to
     * serve an image of the given size.
     *
     * If the given URL starts with `url(`, or is not ending with a number, then
     * it will be set as-is, without any processing. This allows using url data,
     * such as `url(data:image/png;base64,aabbcc)`.
     *
     * Usage:
     *
     * ```html
     * <div naturalBackgroundDensity="/api/image/123/200"></div>
     * <div naturalBackgroundDensity="/non-responsive.jpg"></div>
     * <div naturalBackgroundDensity="url(data:image/png;base64,aabbcc)"></div>
     * ```
     *
     * Will generate something like:
     *
     * ```html
     * <div style="background-image: image-set(url("/api/image/123/200") 1x, url("/api/image/123/300") 1.5x, url("/api/image/123/400") 2x, url("/api/image/123/600") 3x, url("/api/image/123/800") 4x);"></div>
     * <div style="background-image: url("/non-responsive.jpg");"></div>
     * <div style="background-image: url(data:image/png;base64,aabbcc)"></div>
     * ```
     *
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set
     */
    @Input({required: true})
    public set naturalBackgroundDensity(src: string) {
        if (src.startsWith('url(')) {
            this.elementRef.nativeElement.style.backgroundImage = src;
            return;
        }

        // Always include a fallback with standard syntax for browsers that don't support at all, or don't support without
        // prefixes (eg: Chrome v88 that we still see in production)
        const fallback = src ? `url(${src})` : '';
        this.elementRef.nativeElement.style.backgroundImage = fallback;

        const responsive = densities(src, true);
        if (responsive) {
            this.elementRef.nativeElement.style.backgroundImage = responsive;
        }
    }
}
