import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Application } from "../../../../../models/application";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import { markdownMaxCharsMap } from "../../../../../constants";

type Props = {
    applications: Application[];
    getReferenceUrl: (applicatioName: string) => string;
};

const TableBodyApplications = ({ applications, getReferenceUrl }: Props) => (
    <>
        {applications?.length > 0
            ? applications.map((application) => (
                <TableRow key={application.id}>
                    <TableCell>
                        <a href={getReferenceUrl(application.name)} title={application.name}>
                            {application.name}
                        </a>
                    </TableCell>
                    <TableCell>{application.entraApplicationId}</TableCell>
                    <TableCell>
                        <MarkdownProcessor markdownToDisplay={application.description} maxChars={markdownMaxCharsMap.table} />
                    </TableCell>
                </TableRow>
            ))
            : <NoRecordsRow colspan={3} customText="No applications to display" />
        }
    </>
);

export const ApplicationsTable = ({ applications, getReferenceUrl }: Props) => (
    <ScrollableTableContainer>
        <Table className={"fui-table"} size={"small"} aria-label={"Applications List table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <span className="strong">Name</span>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <span className="strong">Entra ID</span>
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
