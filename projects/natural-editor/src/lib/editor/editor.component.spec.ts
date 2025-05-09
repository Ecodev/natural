import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NaturalEditorComponent} from './editor.component';
import {Component, inject, InjectionToken} from '@angular/core';
import {By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {ImageUploader} from '../utils/image';
import {of} from 'rxjs';
import {naturalProviders} from '@ecodev/natural';

const IMAGE_UPLOADER = new InjectionToken<ImageUploader | null>('Image uploader for tests');

@Component({
    template: ` <natural-editor [imageUploader]="imageUploader" [(ngModel)]="myValue" />`,
    imports: [FormsModule, NaturalEditorComponent],
})
class TestHostComponent {
    public readonly imageUploader = inject(IMAGE_UPLOADER);

    public myValue = '';
}

/**
 * This is not exactly awesome, but I couldn't find a better way to get content after Prosemirror processed it
 */
function getProsemirrorContent(fixture: ComponentFixture<TestHostComponent>): string {
    return fixture.debugElement.query(By.css('[contenteditable]')).nativeElement.innerHTML;
}

const html = `<h1>h1</h1>
<h2>h2</h2>
<h3>h3</h3>
<h4>h4</h4>
<h5>h5</h5>
<h6>h6</h6>
<pre><code>code</code></pre>
<p>p"foo</p>
<p style="text-align: right;">right aligned</p>
<p><strong>strong</strong></p>
<p><em>em</em></p>
<p class="my-paragraph-class"><a href="a" title="a">a</a></p>
<table class="my-table-class"><tbody><tr><td style="background-color: #168253;"><p>table</p></td></tr></tbody></table>
<p><img alt="foo" src="some url"></p>
<ul><li><p>ul</p></li></ul>
<ol><li><p>ol</p></li></ol>
<blockquote><p>blockquote</p></blockquote>`;

async function configure(imageUploader: ImageUploader | null): Promise<void> {
    await TestBed.configureTestingModule({
        providers: [
            naturalProviders,
            {
                provide: IMAGE_UPLOADER,
                useValue: imageUploader,
            },
        ],
    }).compileComponents();
}

describe('NaturalEditorComponent', () => {
    let hostComponent: TestHostComponent;
    let component: NaturalEditorComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    describe('with advanced schema', () => {
        beforeEach(async () => {
            await configure(() => of('fake image url'));

            fixture = TestBed.createComponent(TestHostComponent);
            hostComponent = fixture.componentInstance;
            component = fixture.debugElement.query(By.directive(NaturalEditorComponent)).context;
        });

        it('should follow advanced schema rules', done => {
            expect(component).toBeTruthy();

            hostComponent.myValue = html;
            fixture.detectChanges();

            const expected = `<h1>h1</h1>
<h2>h2</h2>
<h3>h3</h3>
<h4>h4</h4>
<h5>h5</h5>
<h6>h6</h6>
<pre><code>code</code></pre>
<p>p"foo</p>
<p style="text-align: right;">right aligned</p>
<p><strong>strong</strong></p>
<p><em>em</em></p>
<p class="my-paragraph-class"><a href="a" title="a">a</a></p>
<table class="my-table-class"><tbody><tr><td style="background-color: rgb(22, 130, 83);"><p>table</p></td></tr></tbody></table>
<p><img src="some url" alt="foo" contenteditable="false" draggable="true"><img class="ProseMirror-separator" alt=""><br class="ProseMirror-trailingBreak"></p>
<ul><li><p>ul</p></li></ul>
<ol><li><p>ol</p></li></ol>
<blockquote><p>blockquote</p></blockquote>`.replace(/\n/g, '');

            setTimeout(() => {
                expect(getProsemirrorContent(fixture)).toBe(expected);
                done();
            });
        });
    });

    describe('with basic schema', () => {
        beforeEach(async () => {
            await configure(null);

            fixture = TestBed.createComponent(TestHostComponent);
            hostComponent = fixture.componentInstance;
            component = fixture.debugElement.query(By.directive(NaturalEditorComponent)).context;
        });

        it('should follow basic schema rules', done => {
            expect(component).toBeTruthy();

            hostComponent.myValue = html;
            fixture.detectChanges();
            const expected = `<h1>h1</h1>
<h2>h2</h2>
<h3>h3</h3>
<h4>h4</h4>
<h5>h5</h5>
<h6>h6</h6>
<p>code</p>
<p>p"foo</p>
<p>right aligned</p>
<p><strong>strong</strong></p>
<p><em>em</em></p>
<p><a href="a" title="a">a</a></p>
<p>table</p>
<p><br class="ProseMirror-trailingBreak"></p>
<ul><li><p>ul</p></li></ul>
<ol><li><p>ol</p></li></ol>
<p>blockquote</p>`.replace(/\n/g, '');

            setTimeout(() => {
                expect(getProsemirrorContent(fixture)).toBe(expected);
                done();
            });
        });
    });
});
