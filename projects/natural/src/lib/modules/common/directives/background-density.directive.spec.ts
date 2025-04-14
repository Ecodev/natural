import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NaturalBackgroundDensityDirective} from './background-density.directive';

@Component({
    template: `
        <div naturalBackgroundDensity></div>
        <div naturalBackgroundDensity="https://example.com/api/image/123/200"></div>
        <div [naturalBackgroundDensity]="url1"></div>
        <div [naturalBackgroundDensity]="url2"></div>
        <div
            style="color: red; background-image: url('foo.jpg');"
            naturalBackgroundDensity="https://example.com/api/image/123/200"
        ></div>
        <div
            style="color: red; background-image: url('foo.jpg');"
            naturalBackgroundDensity="https://example.com/api/image/123.jpg"
        ></div>
        <div naturalBackgroundDensity="https://example.com/api/image/123/201"></div>
        <div naturalBackgroundDensity="url(data:image/png;base64,aabbcc)"></div>
    `,
    imports: [NaturalBackgroundDensityDirective],
})
class TestComponent {
    protected readonly url1 = 'https://example.com/api/image/123/200';
    protected readonly url2 = 'https://example.com/api/image/123.jpg';
}

describe('NaturalBackgroundDensity', () => {
    let fixture: ComponentFixture<TestComponent>;
    let elements: DebugElement[]; // the elements with the directive

    const expected =
        'image-set(url("https://example.com/api/image/123/200") 1x, url("https://example.com/api/image/123/300") 1.5x, url("https://example.com/api/image/123/400") 2x, url("https://example.com/api/image/123/600") 3x, url("https://example.com/api/image/123/800") 4x)';

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);

        fixture.detectChanges(); // initial binding

        // all elements with an attached NaturalBackgroundDensity
        elements = fixture.debugElement.queryAll(By.directive(NaturalBackgroundDensityDirective));
    });

    it('should have 8 active elements', () => {
        expect(elements.length).toBe(8);
    });

    it('1st should be kept empty and should not be used in real world', () => {
        expect(elements[0].nativeElement.style.backgroundImage).toBe('');
    });

    it('2nd should work', () => {
        expect(elements[1].nativeElement.style.backgroundImage).toBe(expected);
    });

    it('3rd should work', () => {
        expect(elements[2].nativeElement.style.backgroundImage).toBe(expected);
    });

    it('4th should support a non-responsive URL', () => {
        expect(elements[3].nativeElement.style.backgroundImage).toBe('url("https://example.com/api/image/123.jpg")');
    });

    it('5th will completely discard original src and srcset attributes', () => {
        expect(elements[4].nativeElement.style.backgroundImage).toBe(expected);
    });

    it('6th will completely discard original src and srcset attributes while keeping naturalBackgroundDensity as-is', () => {
        expect(elements[5].nativeElement.style.backgroundImage).toBe('url("https://example.com/api/image/123.jpg")');
    });

    it('7th will round dimensions', () => {
        const expectedSrcsetUneven =
            'image-set(url("https://example.com/api/image/123/201") 1x, url("https://example.com/api/image/123/302") 1.5x, url("https://example.com/api/image/123/402") 2x, url("https://example.com/api/image/123/603") 3x, url("https://example.com/api/image/123/804") 4x)';

        expect(elements[6].nativeElement.style.backgroundImage).toBe(expectedSrcsetUneven);
    });

    it('8th will allow data url', () => {
        expect(elements[7].nativeElement.style.backgroundImage).toBe('url("data:image/png;base64,aabbcc")');
    });
});
