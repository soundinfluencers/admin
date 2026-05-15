import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "@/widgets/requests/requests-table/model/requests-table.columns.tsx";
import type { IRequest } from "@/entities/requests";

import s from './requests-table.module.scss';

interface RequestsTableProps {
  data: IRequest[];
}

export const RequestsTable: React.FC<RequestsTableProps> = ({ data }) => {
  "use no memo";

  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    // manualSorting: true,
  });

  return (
    <div className={s.tableWrapper}>
      <div className={s.scrollWrapper}>
        <div className={s.tableInner}>

          <div className={s.table}>
            <div className={s.header}>
              {table.getHeaderGroups()[0].headers.map(header => (
                <div key={header.id} className={s.headerCell}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>

            <div className={s.body}>
              {table.getRowModel().rows.map(row => (
                <div key={row.id} className={s.row}>
                  {row.getVisibleCells().map(cell => (
                    <div key={cell.id} className={s.cell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

