import { DebugElement, ViewChild, Component } from '@angular/core';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridComponent } from './grid.component';
import { IgxGridModule } from './index';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { ColumnPinningPosition, RowPinningPosition } from '../common/enums';
import { IPinningConfig } from '../common/grid.interface';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { IgxGridTransaction } from '../tree-grid';
import { IgxTransactionService } from '../../services';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { GridSummaryFunctions } from '../../test-utils/grid-functions.spec';

describe('Row Pinning #grid', () => {
    const FIXED_ROW_CONTAINER = '.igx-grid__tr--pinned ';
    const CELL_CSS_CLASS = '.igx-grid__td';
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;

    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridRowPinningComponent,
                GridRowPinningWithTransactionsComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule
            ]
        })
        .compileComponents();
    }));

    describe('', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should pin rows to top.', () => {
            // pin 2nd data row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.getRowByIndex(0).nativeElement);

            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(2).rowID).toBe(fix.componentInstance.data[2]);

            // pin 3rd data row
            grid.pinRow(fix.componentInstance.data[2]);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[2]);

            expect(grid.getRowByIndex(2).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(3).rowID).toBe(fix.componentInstance.data[3]);

            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 -  grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should pin rows to bottom.', () => {
            fix.componentInstance.pinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Bottom };
            fix.detectChanges();

            // pin 2nd
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].context.index).toBe(fix.componentInstance.data.length - 1);
            expect(pinRowContainer[0].children[0].nativeElement)
                .toBe(grid.getRowByIndex(fix.componentInstance.data.length - 1).nativeElement);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[2]);

            // pin 1st
            grid.pinRow(fix.componentInstance.data[0]);
            fix.detectChanges();

            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer[0].children.length).toBe(2);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[1].context.rowID).toBe(fix.componentInstance.data[0]);

            // check last pinned is fully in view
            const last = pinRowContainer[0].children[1].context.nativeElement;
            expect(last.getBoundingClientRect().bottom - grid.tbody.nativeElement.getBoundingClientRect().bottom).toBe(0);

            // 2 records pinned + 2px border
            expect(grid.pinnedRowHeight).toBe(2 * grid.renderedRowHeight + 2);
            const expectedHeight = parseInt(grid.height, 10) - grid.pinnedRowHeight - 18 -  grid.theadRow.nativeElement.offsetHeight;
            expect(grid.calcHeight - expectedHeight).toBeLessThanOrEqual(1);
        });

        it('should emit onRowPinning on pin/unpin.', () => {
            spyOn(grid.onRowPinning, 'emit').and.callThrough();

            let row = grid.getRowByIndex(0);
            let rowID = row.rowID;
            row.pin();
            fix.detectChanges();

            expect(grid.onRowPinning.emit).toHaveBeenCalledTimes(1);
            expect(grid.onRowPinning.emit).toHaveBeenCalledWith({
                row: row,
                rowID: rowID,
                insertAtIndex: undefined,
                isPinned: true
            });

            row = grid.getRowByIndex(0);
            rowID = row.rowID;
            row.unpin();
            fix.detectChanges();

            expect(grid.onRowPinning.emit).toHaveBeenCalledTimes(2);
        });

        it('should pin/unpin via grid API methods.', () => {
            // pin 2nd row
            grid.pinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);
            expect(pinRowContainer[0].children[0].context.index).toBe(0);
            expect(pinRowContainer[0].children[0].nativeElement).toBe(grid.getRowByIndex(0).nativeElement);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin 2nd row
            grid.unpinRow(fix.componentInstance.data[1]);
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin/unpin via row API methods.', () => {
            // pin 2nd row
            let row = grid.getRowByIndex(1);
            row.pin();
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[1]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);

            // unpin
            row = grid.getRowByIndex(0);
            row.unpin();
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(0);
            pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(0);

            expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
            expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should pin/unpin via row pinned setter.', () => {
              // pin 2nd row
              let row = grid.getRowByIndex(1);
              row.pinned = true;
              fix.detectChanges();

              expect(grid.pinnedRows.length).toBe(1);
              let pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
              expect(pinRowContainer.length).toBe(1);
              expect(pinRowContainer[0].children.length).toBe(1);
              expect(pinRowContainer[0].children[0].context.rowID).toBe(fix.componentInstance.data[1]);

              expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[1]);
              expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[0]);

              // unpin
              row = grid.getRowByIndex(0);
              row.pinned = false;
              fix.detectChanges();

              expect(grid.pinnedRows.length).toBe(0);
              pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
              expect(pinRowContainer.length).toBe(0);

              expect(grid.getRowByIndex(0).rowID).toBe(fix.componentInstance.data[0]);
              expect(grid.getRowByIndex(1).rowID).toBe(fix.componentInstance.data[1]);
        });

        it('should calculate global summaries with both pinned and unpinned collections', () => {
            // enable summaries for each column
            grid.columns.forEach(c => {
                c.hasSummary = true;
            });
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ContactTitle', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            let row = grid.getRowByIndex(1);
            row.pinned = true;
            fix.detectChanges();
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 0);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);

            row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(0);
            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 0);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);
        });

        it('should calculate groupby row summaries only within unpinned collection', () => {
            // enable summaries for each column
            grid.columns.forEach(c => {
                c.hasSummary = true;
            });
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'ContactTitle', dir: SortingDirection.Asc, ignoreCase: false
            });
            fix.detectChanges();

            let row = grid.getRowByIndex(1);
            row.pinned = true;
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);

            // get first summary row and make sure that the pinned record is not contained within the calculations
            let summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['1']);

            // unpin the row and check if the summary is recalculated
            row = grid.pinnedRows[0];
            row.pinned = false;
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(0);
            summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, 3);
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['2']);
        });
    });

    describe(' Editing ', () => {
        beforeEach(fakeAsync(() => {
            fix = TestBed.createComponent(GridRowPinningWithTransactionsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.instance;
            tick();
            fix.detectChanges();
        }));

        it('should allow pinning edited row.', () => {
            grid.updateCell('New value', 'ANTON', 'CompanyName');
            fix.detectChanges();
            grid.pinRow('ANTON');
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('ANTON');
            expect(pinRowContainer[0].children[0].context.rowData.CompanyName).toBe('New value');
        });

        it('should allow pinning deleted row.', () => {
            grid.deleteRow('ALFKI');
            fix.detectChanges();
            grid.pinRow('ALFKI');
            fix.detectChanges();

            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('ALFKI');
        });

        it('should allow pinning added row.', () => {

            grid.addRow({ 'ID': 'Test', 'CompanyName': 'Test'});
            fix.detectChanges();

            grid.pinRow('Test');
            fix.detectChanges();
            expect(grid.pinnedRows.length).toBe(1);
            const pinRowContainer = fix.debugElement.queryAll(By.css(FIXED_ROW_CONTAINER));
            expect(pinRowContainer.length).toBe(1);
            expect(pinRowContainer[0].children.length).toBe(1);
            expect(pinRowContainer[0].children[0].context.rowID).toBe('Test');
        });

        it('should stop editing when edited row is pinned/unpinned.', () => {
            grid.getColumnByName('CompanyName').editable = true;
            fix.detectChanges();
            let cell = grid.getCellByColumn(0, 'CompanyName');
            let cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            cellDomNumber.triggerEventHandler('dblclick', {});
            fix.detectChanges();

            expect(cell.editMode).toBeTruthy();

            grid.pinRow(cell.row.rowID);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.editMode).toBeFalsy();

            cellDomNumber = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1];
            cellDomNumber.triggerEventHandler('dblclick', {});
            fix.detectChanges();

            expect(cell.editMode).toBeTruthy();
            grid.unpinRow(cell.row.rowID);
            fix.detectChanges();
            cell = grid.getCellByColumn(0, 'CompanyName');
            expect(cell.editMode).toBeFalsy();
        });

    });
});

@Component({
    template: `
        <igx-grid
            [pinning]='pinningConfig'
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `
})
export class GridRowPinningComponent {
    public data = SampleTestData.contactInfoDataFull();
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start, rows: RowPinningPosition.Top };

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public instance: IgxGridComponent;
}


@Component({
    template: `
        <igx-grid
            [pinning]='pinningConfig'
            primaryKey='ID'
            [width]='"800px"'
            [height]='"500px"'
            [data]="data"
            [autoGenerate]="true">
        </igx-grid>
    `,
    providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
})
export class GridRowPinningWithTransactionsComponent extends GridRowPinningComponent {
    public data = SampleTestData.contactInfoDataFull();
}
