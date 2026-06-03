import type { ColumnDef } from "@tanstack/react-table";
import styles from "../ui/menu.module.scss";

import type {
    WhatsAppSendRow,
} from "@/widgets/campaign-management/campaign-management-controls/ui/menu/model/menu.types.ts";

export const whatsAppColumns: ColumnDef<WhatsAppSendRow>[] = [
    {
        accessorKey: "phone",
        header: "Phone",
        size: 127,
        cell: ({ row }) => (
            <div className={styles.whatsAppCell}>
                {row.original.phone || "—"}
            </div>
        ),
    },
    {
        accessorKey: "networks",
        header: "Networks",
        size: 105,
        cell: ({ row }) => (
            <div className={styles.whatsAppCell}>
                {row.original.networks || "—"}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 105,
        cell: ({ row }) => (
            <div className={styles.whatsAppCell}>
                {row.original.status || ""}
            </div>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        size: 180,
        cell: ({ row }) => (
            <div className={styles.whatsAppCell}>
                {row.original.date || ""}
            </div>
        ),
    },
];