import { 
  type ColumnDef, 
  type TableOptions, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";

import s from './table.module.scss';

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: TableOptions<TData>["getRowId"];
  showFooter?: boolean;
  enableSorting?: boolean;
}

export function Table<TData>({ 
  data, 
  columns,
  getRowId,
  showFooter,
  enableSorting = false,
}: TableProps<TData>) {
  "use no memo";

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    enableSorting,
    enableMultiSort: false,
    enableSortingRemoval: true,
    sortDescFirst: false,

    defaultColumn: {
      enableSorting: false,
    },
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
                  {headerGroup.headers.map((header) => {
                    const canSort =
                      !header.isPlaceholder &&
                      header.column.getCanSort();

                    const sorted = header.column.getIsSorted();
                    const nextOrder = header.column.getNextSortingOrder();

                    const sortTitle =
                      nextOrder === "asc"
                        ? "Sort ascending"
                        : nextOrder === "desc"
                          ? "Sort descending"
                          : "Clear sorting";

                    const content = header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      );

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={s.th}
                        scope={header.colSpan > 1 ? "colgroup" : "col"}
                        data-align={header.column.columnDef.meta?.align}
                        style={{ minWidth: header.column.columnDef.size }}
                        aria-sort={
                          canSort && sorted
                            ? sorted === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                      >
                        {canSort ? (
                          <button
                            type="button"
                            className={s.sortButton}
                            onClick={header.column.getToggleSortingHandler()}
                            title={sortTitle}
                          >
                            {content}

                            <svg
                              className={s.sortIcon}
                              data-sort={sorted || "none"}
                              width="12"
                              height="16"
                              viewBox="0 0 12 16"
                              fill="none"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path
                                className={s.sortUp}
                                d="M3 6L6 3L9 6"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                className={s.sortDown}
                                d="M3 10L6 13L9 10"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          content
                        )}
                      </th>
                    );
                  })}
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
