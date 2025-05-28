import {Component, computed, inject, input, Input, OnChanges, OnInit, SimpleChanges, output} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {Observable, of, Subject, tap} from 'rxjs';
import {NaturalFileService} from '../file.service';
import {CommonModule, DOCUMENT} from '@angular/common';
import {FileModel} from '../types';
import {NaturalAlertService} from '../../alert/alert.service';
import {NaturalCapitalizePipe} from '../../common/pipes/capitalize.pipe';
import {NaturalIconDirective} from '../../icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatRippleModule} from '@angular/material/core';
import {NaturalFileDropDirective} from '../file-drop.directive';
import {NaturalBackgroundDensityDirective} from '../../common/directives/background-density.directive';

// @dynamic
@Component({
    selector: 'natural-file',
    templateUrl: './file.component.html',
    styleUrl: './file.component.scss',
    imports: [
        NaturalFileDropDirective,
        MatRippleModule,
        CommonModule,
        MatIconModule,
        NaturalIconDirective,
        NaturalCapitalizePipe,
        NaturalBackgroundDensityDirective,
    ],
    host: {
        '[style.height.px]': 'height()',
    },
})
export class NaturalFileComponent implements OnInit, OnChanges {
    private readonly naturalFileService = inject(NaturalFileService);
    private readonly alertService = inject(NaturalAlertService);
    private readonly document = inject(DOCUMENT);

    public readonly height = input(250);
    public readonly iconHeight = computed(() => Math.min(this.height() * 0.66, 120));
    public readonly fontSize = computed(() => Math.min(this.height() * 0.3, 36));

    @Input() public action: 'upload' | 'download' | null = null;

    @Input() public backgroundSize = 'contain';

    /**
     * Overrides the default download link by passing a function that received the
     * file object and returns the download link
     */
    @Input() public downloadLinkFn?: (file: FileModel | null) => null | string;

    /**
     * Comma-separated list of unique file type specifiers. Like the native element,
     * it can be a mix of mime-type and file extensions.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
     */
    @Input() public accept =
        'image/avif,image/bmp,image/gif,image/heic,image/heif,image/jpeg,image/pjpeg,image/png,image/svg+xml,image/svg,image/webp';

    /**
     * If given, it will be called when a new file is selected. The callback should typically upload the file
     * to the server and link the newly uploaded file to the existing related object.
     *
     * The callback **must** be able to run even if the calling component has been destroyed. That means in most
     * cases you **must** `bind()` the callback explicitly, like so:
     *
     * ```html
     * <natural-file [uploader]="myCallback.bind(this)" />
     * ```
     *
     * Also, you probably **should** set a `[formCtrl]` so that the form is updated automatically, instead of doing
     * it manually within the callback.
     */
    @Input() public uploader?: (file: File) => Observable<FileModel>;

    @Input() public model: FileModel | null = null;

    /**
     * If provided, its value will get updated when the model changes.
     * But its value is never read, so if you want to set a value use `[model]` instead.
     */
    @Input() public formCtrl: AbstractControl | null | undefined = null;

    /**
     * This **must not** be used to mutate the server, because it is very likely it will never be called if the
     * human navigates away from the page before the upload is finished. Instead, you should use `[uploader]`.
     */
    public readonly modelChange = output<FileModel>();

    public imagePreview = '';
    public filePreview: string | null = null;

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.model && changes.model.previousValue !== changes.model.currentValue) {
            this.updateImage();
        }
    }

    public ngOnInit(): void {
        this.updateImage();
    }

    public upload(file: File): void {
        this.model = {file: file};
        this.updateImage();

        if (this.formCtrl) {
            this.formCtrl.setValue(this.model);
        }

        const observable =
            this.uploader?.(file).pipe(tap(() => this.alertService.info($localize`Mis à jour`))) ?? of(this.model);

        observable.subscribe(result => {
            this.model = result;
            if (this.formCtrl) {
                this.formCtrl.setValue(this.model);
            }

            this.modelChange.emit(this.model);
        });
    }

    public getDownloadLink(): null | string {
        if (this.action !== 'download') {
            return null;
        }

        return this.downloadLinkFn
            ? this.downloadLinkFn(this.model)
            : this.naturalFileService.getDownloadLink(this.model);
    }

    private updateImage(): void {
        this.imagePreview = '';
        this.filePreview = null;
        if (!this.model) {
            return;
        }

        if (this.model.file?.type.startsWith('image/')) {
            // Model from upload (before saving)
            this.getBase64(this.model.file).subscribe(result => {
                if (this.model?.file?.type) {
                    const content = 'url(data:' + this.model?.file?.type + ';base64,' + result + ')';
                    this.imagePreview = content;
                }
            });
        } else if (this.model.file) {
            this.filePreview = this.model.file.type.split('/')[1];
        } else if (this.model.__typename === 'Image' && this.model.id) {
            // Model image with id, use specific API to render image by size
            const window = this.document.defaultView;
            if (!window) {
                throw new Error('Could not show image preview because `window` is undefined');
            }

            const loc = window.location;
            const height = this.height() ? '/' + this.height() : '';

            // create image url without port to stay compatible with dev mode
            const image = loc.protocol + '//' + loc.hostname + '/api/image/' + this.model.id + height;
            this.imagePreview = image;
        } else if (this.model?.mime && ['File', 'AccountingDocument'].includes(this.model.__typename || '')) {
            this.filePreview = this.model.mime.split('/')[1];
        } else if (this.model.src) {
            // external url
            this.imagePreview = this.model.src;
        }
    }

    private getBase64(file: File | null): Observable<string> {
        if (!file) {
            return of('');
        }

        const subject = new Subject<string>();

        const reader = new FileReader();
        reader.addEventListener('load', (ev: any) => {
            subject.next(btoa(ev.target.result));
            subject.complete();
        });
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        reader.readAsBinaryString(file);

        return subject.asObservable();
    }
}
