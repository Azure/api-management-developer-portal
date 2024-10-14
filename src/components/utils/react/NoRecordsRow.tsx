import * as React from "react";
import { TableCell, TableRow } from "@fluentui/react-components";

type TNoRecordsRowProps = {
    colspan: number;
    customText?: string;
}

export const NoRecordsRow = ({ colspan, customText }: TNoRecordsRowProps) => (
    <TableRow>
        <TableCell colSpan={colspan} style={{ textAlign: "center" }}>{customText ?? 'No records to show'}</TableCell>
    </TableRow>
);
