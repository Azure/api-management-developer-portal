import * as React from "react";
import { Spinner, TableCell, TableRow } from "@fluentui/react-components";
import { InfoTable } from "@microsoft/api-docs-ui";
import { Subscription } from "../../../../../models/subscription";

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
        <InfoTable
            title={"Your Subscriptions list"}
            columnLabels={["Name", "Status"]}
            children={
                subscriptions?.map((sub) => (
                    <TableRow key={sub.id}>
                        <TableCell>{sub.name}</TableCell>
                        <TableCell>{sub.state}</TableCell>
                    </TableRow>
                ))
            }
        />
    );
