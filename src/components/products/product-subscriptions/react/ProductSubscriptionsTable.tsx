import * as React from "react";
import {
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Subscription } from "../../../../models/subscription";

export const ProductSubscriptionsTable = ({
    subscriptions,
    working,
}: {
    subscriptions: Subscription[];
    working: boolean;
}) =>
    working ? (
        <Spinner
            label="Loading Subsriptions"
            labelPosition="below"
            size="small"
        />
    ) : !subscriptions || subscriptions.length === 0 ? (
        <span className="strong" style={{ display: "block", padding: "1rem 0" }}>You don't have subscriptions yet.</span>
    ) : (
        <Table className={"fui-table"} size={"small"} aria-label={"Your Subscriptions list"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <span className="strong">Name</span>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <span className="strong">Status</span>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>

            <TableBody>
                {subscriptions?.map((sub) => (
                    <TableRow key={sub.id}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell>{sub.state}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
