import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import { markdownMaxCharsMap } from "../../../../../constants";

type Props = {
    products: Product[];
    getReferenceUrl: (productName: string) => string;
};

const TableBodyApplications = ({ applications, getReferenceUrl }) => (
    <>
        {applications?.length > 0
            ? applications.map((application) => (
                <TableRow key={application.id}>
                    <TableCell>
                        <a href={getReferenceUrl(application.name)} title={application.displayName}>
                            {application.displayName}
                        </a>
                    </TableCell>
                    <TableCell>{application.clientId}</TableCell>
                    <TableCell>{application.owner}</TableCell>
                    <TableCell>
                        <MarkdownProcessor markdownToDisplay={application.description} maxChars={markdownMaxCharsMap.table} />
                    </TableCell>
                </TableRow>
            ))
            : <NoRecordsRow colspan={2} customText="No products to display" />
        }
    </>
);

export const ApplicationsTable = ({ applications, getReferenceUrl }) => (
    <ScrollableTableContainer>
        <Table className={"fui-table"} size={"small"} aria-label={"Applications List table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <span className="strong">Name</span>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <span className="strong">Client ID</span>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <span className="strong">Owner</span>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <span className="strong">Description</span>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableBodyApplications
                    applications={applications}
                    getReferenceUrl={getReferenceUrl}
                />
            </TableBody>
        </Table>
    </ScrollableTableContainer>
);
