import {Injectable} from '@angular/core';
import {FileModel, Literal, NaturalAbstractModelService, PaginatedData, QueryVariables} from '@ecodev/natural';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class FileService extends NaturalAbstractModelService<
    FileModel,
    {id: string},
    PaginatedData<FileModel>,
    QueryVariables,
    FileModel,
    {input: FileModel},
    FileModel,
    {id: string; input: Literal},
    boolean,
    {ids: string[]}
> {
    private id = 1;

    public constructor() {
        super('user', null, null, null, null, null);
    }

    public getFileModel(): FileModel {
        const id = this.id++;
        return {
            id: '' + id,
        };
    }

    public override watchAll(): Observable<PaginatedData<FileModel>> {
        return of({
            items: [
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
            ],
            length: 20,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public override getAll(): Observable<PaginatedData<FileModel>> {
        return of({
            items: [
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
            ],
            length: 20,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public override getOne(): Observable<FileModel> {
        return of(this.getFileModel());
    }

    public override create(object: FileModel): Observable<FileModel> {
        return of({...object, id: this.id++ as any}).pipe(delay(500));
    }

    public override delete(): Observable<boolean> {
        return of(true).pipe(delay(500));
    }
}
