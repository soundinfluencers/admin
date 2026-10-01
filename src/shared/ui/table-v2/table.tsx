import { 
  type ColumnDef, 
  type RowData,
  type TableOptions, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
} from "@tanstack/react-table";

import s from './table.module.scss';

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right";
  }
}

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: TableOptions<TData>["getRowId"];
  showFooter?: boolean;
}

export function Table<TData>({ 
  data, 
  columns,
  getRowId,
  showFooter,
}: TableProps<TData>) {
  "use no memo";

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={s.tableWrapper}>
      <div className={s.scrollWrapper}>
        <div className={s.tableInner}>
          <table className={s.table}>
            <thead className={s.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={s.tr}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={s.th}
                    scope={header.colSpan > 1 ? "colgroup" : "col"}
                    data-align={header.column.columnDef.meta?.align}
                    style={{ minWidth: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </th>
                ))}
              </tr>
            ))}
            </thead>

            <tbody className={s.tbody}>
            {rows.length === 0 ? (
              <tr className={s.tr}>
                <td
                  colSpan={Math.max(1, table.getVisibleLeafColumns().length)}
                  className={s.stateCell}
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={s.tr}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={s.td}
                      data-align={cell.column.columnDef.meta?.align}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
            </tbody>

            {showFooter && (
              <tfoot className={s.tfoot}>
                {table.getFooterGroups().map((footerGroup) => (
                  <tr key={footerGroup.id} className={s.tr}>
                    {footerGroup.headers.map((footer) => (
                      <td 
                        key={footer.id}
                        colSpan={footer.colSpan}
                        className={s.td}
                        data-align={footer.column.columnDef.meta?.align}
                      >
                        {footer.isPlaceholder 
                          ? null
                          : flexRender(
                            footer.column.columnDef.footer, 
                            footer.getContext(),
                          )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
