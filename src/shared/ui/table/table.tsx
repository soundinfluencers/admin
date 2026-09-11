import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMediaQuery } from "@/shared/hooks/use-media-query.ts";
import clsx from "clsx";

import styles from './table.module.scss';

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isManualPagination?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
  emptyText?: string;
  minWidth?: number;
  tableLayout?: "fixed" | "auto";
  skeletonRows?: number;

  scrollWrapperClassName?: string;
}

export function Table<TData>({
  data,
  columns,
  isManualPagination = false,
  isFetching = false,
  isLoading = false,
  emptyText = "No data available",
  minWidth = 1220,
  tableLayout = "fixed",
  skeletonRows = 10,
  scrollWrapperClassName = "",
}: TableProps<TData>) {
  "use no memo";

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: isManualPagination,
  });

  const rows = table.getRowModel().rows;

  const isTablet = useMediaQuery("(max-width: 811px)");
  const verticalSpacing = isTablet ? 8 : 16;

  const showOverlay = isFetching && rows.length > 0;
  const showSkeleton = isLoading;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className={styles.tableWrapper}>

      <div
        className={clsx(styles.scrollWrapper, scrollWrapperClassName)}
      >

        <div
          className={styles.tableInner}
          style={{
            minWidth: minWidth,
          }}
        >
          {showOverlay && <div className={styles.overlay}/>}

          <table
            className={styles.table}
            style={{
              tableLayout: tableLayout,
            }}
          >
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.th}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    <div className={styles.headCell}>
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

            <tbody className={styles.tbody}>
              {showSkeleton ? (
                Array.from({ length: skeletonRows }).map((_, rowIndex) => {
                  const isFirst = rowIndex === 0;
                  const isLast = rowIndex === skeletonRows - 1;

                  return (
                    <tr key={`skeleton-row-${rowIndex}`} className={styles.tr}>
                      {columns.map((_, columnIndex) => (
                        <td
                          key={`skeleton-cell-${rowIndex}-${columnIndex}`}
                          className={styles.td}
                          style={{
                            paddingTop: isFirst ? verticalSpacing : undefined,
                            paddingBottom: isLast ? verticalSpacing : undefined,
                          }}
                        >
                          <div className={styles.skeletonCell}/>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : showEmpty ? (
                <tr>
                  <td colSpan={columns.length} className={styles.stateCell}>
                    {emptyText}
                  </td>
                </tr>
              ) : (
                rows.map((row, index, array) => {
                  const isFirst = index === 0;
                  const isLast = index === array.length - 1;

                  return (
                    <tr key={row.id} className={styles.tr}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={styles.td}
                          style={{
                            width: cell.column.getSize(),
                            paddingTop: isFirst ? verticalSpacing : undefined,
                            paddingBottom: isLast ? verticalSpacing : undefined,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className={styles.footer}/>
        </div>

      </div>

    </div>
  );
}
