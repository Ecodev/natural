import {inject, Injectable} from '@angular/core';
import type { MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {MatDialog} from '@angular/material/dialog';
import {defaults} from 'es-toolkit/compat';
import type {
    HierarchicDialogConfig,
    HierarchicDialogResult} from './hierarchic-selector-dialog.component';
import {
    NaturalHierarchicSelectorDialogComponent,
} from './hierarchic-selector-dialog.component';

@Injectable({providedIn: 'root'})
export class NaturalHierarchicSelectorDialogService {
    private readonly dialog = inject(MatDialog);

    public open(
        hierarchicConfig: HierarchicDialogConfig,
        dialogConfig?: MatDialogConfig,
    ): MatDialogRef<NaturalHierarchicSelectorDialogComponent, HierarchicDialogResult> {
        const defaultDialogConfig = {
            width: '700px',
            maxWidth: '700px',
            data: hierarchicConfig,
        };

        return this.dialog.open<
            NaturalHierarchicSelectorDialogComponent,
            HierarchicDialogConfig,
            HierarchicDialogResult
        >(NaturalHierarchicSelectorDialogComponent, defaults(dialogConfig, defaultDialogConfig));
    }
}
