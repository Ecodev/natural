import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FileModel, FileSelection, NaturalFileService} from '@ecodev/natural';
import {Observable, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NaturalFileComponent} from '../../../projects/natural/src/lib/modules/file/component/file.component';
import {NaturalFileDropDirective} from '../../../projects/natural/src/lib/modules/file/file-drop.directive';
import {NaturalFileSelectDirective} from '../../../projects/natural/src/lib/modules/file/file-select.directive';
import {FileService} from './file.service';

type JsonFile = {
    name: string;
    type: string;
    size: number;
    lastModified: number;
};

type JsonFileSelection = {
    valid: JsonFile[];
    invalid: {
        error: string;
        file: JsonFile;
    }[];
};

function fileToJson(file: File): JsonFile {
    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
    };
}

function selectionToJson(selection: FileSelection): JsonFileSelection {
    return {
        valid: selection.valid.map(fileToJson),
        invalid: selection.invalid.map(item => {
            return {
                error: item.error,
                file: fileToJson(item.file),
            };
        }),
    };
}

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrl: './file.component.scss',
    imports: [
        MatCheckboxModule,
        FormsModule,
        MatButtonModule,
        NaturalFileSelectDirective,
        NaturalFileDropDirective,
        NaturalFileComponent,
        CommonModule,
    ],
})
export class FileComponent {
    private readonly uploadService = inject(NaturalFileService);
    private readonly fileService = inject(FileService);

    public height = 250;
    public disabled = false;
    public fileOver: boolean | null = null;
    public fileOverJpg: boolean | null = null;
    public fileOverSelectable: boolean | null = null;
    public fileOverSelectableJpg: boolean | null = null;
    public fileOverMaxSize: boolean | null = null;
    public fileOverService: boolean | null = null;
    private subscription: Subscription | null = null;

    public model: FileModel | null = null;

    public fileChange(file: File): void {
        console.log('fileChange', fileToJson(file));
    }

    public filesChange(selection: FileSelection): void {
        console.log('filesChange', selectionToJson(selection));
    }

    public subscribe(): void {
        if (this.subscription) {
            return;
        }

        this.subscription = this.uploadService.filesChanged.subscribe(selection =>
            console.log('service filesChanged', selectionToJson(selection)),
        );
    }

    public unsubscribe(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    public modelChange($event: FileModel): void {
        console.log({
            ...$event,
            file: $event.file ? fileToJson($event.file) : null,
        });
    }

    public setImage(): void {
        this.model = {
            __typename: 'Image',
            id: '123',
            mime: 'image/jpeg',
        };
    }

    public setImageWithSrc(): void {
        this.model = {
            id: '456',
            src: './assets/logo.svg',
        };
    }

    public setFile(): void {
        this.model = {
            __typename: 'File',
            id: '789',
            mime: 'application/pdf',
        };
    }

    public clear(): void {
        this.model = null;
    }

    public uploadAndLink(file: File): Observable<any> {
        return this.fileService
            .create({file: file})
            .pipe(
                tap(uploadedFile => console.log('pretend to do something more with the uploaded file', uploadedFile)),
            );
    }
}
