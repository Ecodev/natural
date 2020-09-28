import {Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Observable, of, Subject} from 'rxjs';
import {NaturalFileService} from '../file.service';
import {NaturalAbstractModelService} from '../../../services/abstract-model.service';
import {PaginatedData} from '../../../classes/data-source';
import {QueryVariables} from '../../../classes/query-variable-manager';

export type FileModel = {
    __typename?: 'File' | 'AccountingDocument' | 'Image';
    id?: string;
    file?: File;
    mime?: string;
    src?: string;
};

export function getDownloadLink(model: FileModel | null): null | string {
    const hostname = window.location.protocol + '//' + window.location.hostname;

    if (model?.__typename === 'File') {
        return hostname + '/file/' + model.id;
    } else if (model?.__typename === 'AccountingDocument') {
        return hostname + '/accounting-document/' + model.id;
    } else if (model?.__typename === 'Image') {
        return hostname + '/image/' + model.id;
    }

    return null;
}

@Component({
    selector: 'natural-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
    providers: [NaturalFileService],
})
export class FileComponent implements OnInit, OnChanges {
    @HostBinding('style.height.px') @Input() public height = 250;

    @Input() public action: 'upload' | 'download' | null = null;

    @Input() public backgroundSize = 'contain';

    /**
     * Comma separated list of accepted mimetypes
     */
    @Input() public accept = 'image/bmp,image/gif,image/jpeg,image/pjpeg,image/png,image/svg+xml,image/svg,image/webp';

    @Input() public service?: NaturalAbstractModelService<
        unknown,
        any,
        PaginatedData<any>,
        QueryVariables,
        FileModel,
        any,
        any,
        any,
        unknown,
        any
    >;

    @Input() public model: FileModel | null = null;

    /**
     * If provided, get updated on change
     * Is not used for reading -> use [model]
     */
    @Input() public formCtrl?: AbstractControl;

    @Output() public modelChange = new EventEmitter<FileModel>();

    public imagePreview: SafeStyle | null = null;
    public filePreview: string | null = null;

    constructor(private naturalFileService: NaturalFileService, private sanitizer: DomSanitizer) {}

    public ngOnInit(): void {
        this.updateImage();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.model && changes.model.previousValue !== changes.model.currentValue) {
            this.updateImage();
        }
    }

    public upload(file: File): void {
        this.model = {file: file};
        this.updateImage();

        if (this.formCtrl) {
            this.formCtrl.setValue(this.model);
        }

        if (this.service) {
            this.service.create(this.model).subscribe(result => {
                this.model = result;
                this.modelChange.emit(result);
            });
        } else {
            this.modelChange.emit(this.model);
        }
    }

    public getDownloadLink(): null | string {
        if (this.action !== 'download') {
            return null;
        }

        return getDownloadLink(this.model);
    }

    private updateImage(): void {
        this.imagePreview = null;
        this.filePreview = null;
        if (!this.model) {
            return;
        }

        if (this.model.file?.type.includes('image/')) {
            // Model from upload (before saving)
            this.getBase64(this.model.file).subscribe(result => {
                const content = 'url(data:' + this.model?.file?.type + ';base64,' + result + ')';
                this.imagePreview = this.sanitizer.bypassSecurityTrustStyle(content);
            });
        } else if (this.model.file) {
            this.filePreview = this.model.file.type.split('/')[1];
        } else if (this.model.__typename === 'Image' && this.model.id) {
            // Model image with id, use specific API to render image by size
            const loc = window.location;
            const height = this.height ? '/' + this.height : '';

            // create image url without port to stay compatible with dev mode
            const image = loc.protocol + '//' + loc.hostname + '/image/' + this.model.id + height;
            this.imagePreview = this.sanitizer.bypassSecurityTrustStyle('url(' + image + ')');
        } else if (this.model?.mime && ['File', 'AccountingDocument'].includes(this.model.__typename || '')) {
            this.filePreview = this.model.mime.split('/')[1];
        } else if (this.model.src) {
            // external url
            this.imagePreview = this.sanitizer.bypassSecurityTrustStyle('url(' + this.model.src + ')');
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
        reader.readAsBinaryString(file);

        return subject.asObservable();
    }
}
