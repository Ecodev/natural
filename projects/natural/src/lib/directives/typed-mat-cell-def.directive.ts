/* eslint-disable  @angular-eslint/directive-class-suffix */
import {Directive, forwardRef, input} from '@angular/core';
import {CdkCellDef} from '@angular/cdk/table';
import {MatCellDef} from '@angular/material/table';
import {type Observable} from 'rxjs';
import {type DataSource} from '@angular/cdk/collections';

/**
 * Exactly the same as the original `MatCellDef`, but with the additional `dataSource`
 * input to specify the type of the element.
 *
 * Usage:
 *
 * ```html
 * <table mat-table [dataSource]="dataSource">
 *     <ng-container matColumnDef="name">
 *         <th *matHeaderCellDef mat-header-cell>Name</th>
 *         <td *matCellDef="let element; dataSource: dataSource" mat-cell>
 *             {{ element.name }}
 *         </td>
 *     </ng-container>
 * </table>
 * ```
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[matCellDef]', // same selector as MatCellDef
    providers: [{provide: CdkCellDef, useExisting: forwardRef(() => TypedMatCellDef)}],
})
export class TypedMatCellDef<T> extends MatCellDef {
    /**
     * Should be the same value as the one used in `<table mat-table [dataSource]="dataSource">`
     */
    public readonly matCellDefDataSource = input<T[] | Observable<T[]> | DataSource<T>>();

    public static ngTemplateContextGuard<T>(dir: TypedMatCellDef<T>, ctx: any): ctx is {$implicit: T; index: number} {
        return true;
    }
}
