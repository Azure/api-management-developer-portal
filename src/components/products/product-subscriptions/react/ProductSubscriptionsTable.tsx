import * as React from "react";
import {
    Body1Strong,
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
        <Body1Strong>You don't have subscriptions yet.</Body1Strong>
    ) : (
        <Table className={"fui-table"} size={"small"} aria-label={"Your Subscriptions list"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <Body1Strong>Name</Body1Strong>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Body1Strong>Status</Body1Strong>
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
