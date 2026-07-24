import {Component, viewChild} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Subject} from 'rxjs';
import {naturalProviders} from '../../../classes/providers';
import {type FileModel} from '../types';
import {NaturalFileComponent} from './file.component';

@Component({
    imports: [ReactiveFormsModule, NaturalFileComponent],
    template: `<natural-file [formCtrl]="formGroup.controls.image" [uploader]="uploader" />`,
})
class TestHostWithUploaderComponent {
    public readonly formGroup = new FormGroup({
        image: new FormControl<FileModel | null>(null),
    });
    public readonly upload$ = new Subject<FileModel>();
    public readonly uploader = (): Subject<FileModel> => this.upload$;
    public readonly naturalFile = viewChild.required(NaturalFileComponent);
}

@Component({
    imports: [ReactiveFormsModule, NaturalFileComponent],
    template: `<natural-file [formCtrl]="formGroup.controls.image" />`,
})
class TestHostWithoutUploaderComponent {
    public readonly formGroup = new FormGroup({
        image: new FormControl<FileModel | null>(null),
    });
    public readonly naturalFile = viewChild.required(NaturalFileComponent);
}

describe('NaturalFileComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [naturalProviders],
        }).compileComponents();
    });

    describe('with an asynchronous uploader', () => {
        let fixture: ComponentFixture<TestHostWithUploaderComponent>;
        let component: TestHostWithUploaderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestHostWithUploaderComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create an instance', () => {
            expect(fixture).toBeTruthy();
            expect(component).toBeTruthy();
        });

        it('should not push the transient upload placeholder into the form control before the upload completes', () => {
            const file = new File(['content'], 'photo.png', {type: 'image/png'});

            component.naturalFile().upload(file);

            // The preview is handled internally (via `imagePreview`/`filePreview`), but the form control must
            // not receive the raw, unserializable `File` placeholder in the meantime. Otherwise a premature
            // form submission (before the upload finishes) would send that placeholder to the server instead
            // of a proper entity reference
            expect(component.formGroup.controls.image.value).toBeNull();

            const image: FileModel = {__typename: 'Image', id: '42'};
            component.upload$.next(image);

            expect(component.formGroup.controls.image.value).toEqual(image);
        });

        it('should mark the (parent) form invalid while the upload is pending, and valid again once it resolves', () => {
            expect(component.formGroup.valid).toBe(true);

            const file = new File(['content'], 'photo.png', {type: 'image/png'});
            component.naturalFile().upload(file);

            // Blocks a premature submission: without this, the form could be saved with `image: null` while an
            // orphaned `Image` entity keeps being created server-side in the background, never linked to anything.
            expect(component.formGroup.valid).toBe(false);

            const image: FileModel = {__typename: 'Image', id: '42'};
            component.upload$.next(image);

            expect(component.formGroup.valid).toBe(true);
        });
    });

    describe('without an uploader', () => {
        let fixture: ComponentFixture<TestHostWithoutUploaderComponent>;
        let component: TestHostWithoutUploaderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestHostWithoutUploaderComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should set the form control synchronously with the raw file, and keep the form valid', () => {
            const file = new File(['content'], 'photo.png', {type: 'image/png'});

            component.naturalFile().upload(file);

            expect(component.formGroup.controls.image.value).toEqual({file});
            expect(component.formGroup.valid).toBe(true);
        });
    });
});
