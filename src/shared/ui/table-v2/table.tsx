import { 
  type ColumnDef, 
  type TableOptions, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
} from "@tanstack/react-table";

import s from './table.module.scss';

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
                  >
                    <div className={s.headCell}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </div>
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
                    <td key={cell.id} className={s.td}>
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
