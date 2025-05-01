import * as React from "react";
import { useState } from "react";
import {
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Spinner,
    TableCell,
    TableCellActions,
    TableRow,
} from "@fluentui/react-components";
import {
    ArrowSyncFilled,
    ArrowSyncRegular,
    EditRegular, EyeOffRegular, EyeRegular,
    MoreHorizontalRegular,
    ProhibitedFilled,
} from "@fluentui/react-icons";
import { InfoTable } from "@microsoft/api-docs-ui";
import { Subscription } from "../../../../../models/subscription";
import { formatDate } from "../../../../utils";
import { ValueOrFieldWBtn } from "../../../../utils/react/ValueOrField";

const hiddenKey = "XXXXXXXXXXXXXXXXXXXXXXXXXX";

const subscriptionDateRender = (sub: Subscription) => {
    if (sub.isAwaitingApproval) return `Requested on ${formatDate(sub.createdDate)}`;
    if (sub.isActive && sub.startDate) return `${formatDate(new Date(sub.startDate))}`;

    return undefined;
}

type TPropsCommon = {
    saveName: (subscriptionId: string, editName: string) => Promise<unknown>
    cancelSubscription: (subscriptionId: string) => Promise<unknown>
    regeneratePKey: (subscriptionId: string) => Promise<void>
    regenerateSKey: (subscriptionId: string) => Promise<void>
}

const SubscriptionRow = ({ sub, saveName, cancelSubscription, regeneratePKey, regenerateSKey }: TPropsCommon & { sub: Subscription }) => {
    const [working, setWorking] = useState(false);
    const [workingPKey, setWorkingPKey] = useState(false);
    const [workingSKey, setWorkingSKey] = useState(false);
    const [editName, setEditName] = React.useState(false);
    const [primaryHidden, setPrimaryHidden] = React.useState(true);
    const [secondaryHidden, setSecondaryHidden] = React.useState(true);

    const makeBusy = async (promise: Promise<unknown>, setBusy = setWorking): Promise<unknown> => {
        setBusy(true);
        return promise.finally(() => setBusy(false));
    }

    const MenuActions = [
        sub.isActive && (() => <MenuItem
            onClick={() => {
                setPrimaryHidden(!(primaryHidden && secondaryHidden));
                setSecondaryHidden(!(primaryHidden && secondaryHidden));
            }}
            icon={primaryHidden && secondaryHidden ? <EyeRegular /> : <EyeOffRegular />}
        >
            {primaryHidden && secondaryHidden ? "Show keys" : "Hide keys"}
        </MenuItem>),
        sub.isActive && (() => <MenuItem
            onClick={() => makeBusy(makeBusy(regeneratePKey(sub.id), setWorkingPKey))}
            icon={workingPKey ? <Spinner size={"extra-tiny"} /> : <ArrowSyncFilled />}
            disabled={working}
        >
            Regenerate primary key
        </MenuItem>),
        sub.isActive && (() => <MenuItem
            onClick={() => makeBusy(makeBusy(regenerateSKey(sub.id), setWorkingSKey))}
            icon={workingSKey ? <Spinner size={"extra-tiny"} /> : <ArrowSyncRegular />}
            disabled={working}
        >
            Regenerate secondary key
        </MenuItem>),
        sub.canBeCancelled() && (() => (
            <MenuItem
                onClick={() => makeBusy(cancelSubscription(sub.id))}
                icon={<ProhibitedFilled style={{ color: "red" }} />}
                style={{ color: "red" }}
                disabled={working}
            >
                Cancel subscription
            </MenuItem>
        ))
    ].filter(Boolean);
    
    return (
        <TableRow>
            <TableCell>
                <ValueOrFieldWBtn
                    isEdit={editName}
                    value={sub.name}
                    save={editName => makeBusy(saveName(sub.id, editName).then(() => setEditName(false)))}
                    cancel={() => setEditName(false)}
                    inputProps={{ disabled: working, style: { margin: 0 } }}
                />
                <TableCellActions>
                    {!editName && (
                        <Button
                            size="small"
                            icon={<EditRegular />}
                            appearance="subtle"
                            aria-label="Edit"
                            onClick={() => setEditName(true)}
                            disabled={working}
                        />
                    )}
                </TableCellActions>
            </TableCell>

            <TableCell>
                {sub.productName}
            </TableCell>

            <TableCell>
                {sub.state}
            </TableCell>

            {!sub.isActive
                ? <TableCell colSpan={4}>
                    <i>The subscription is not active</i>
                  </TableCell>
                : <>
                    <TableCell>
                        {workingPKey ? <Spinner size={"extra-tiny"} /> : primaryHidden ? hiddenKey : sub.primaryKey}
                        <TableCellActions>
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={primaryHidden ? <EyeRegular /> : <EyeOffRegular />}
                                onClick={() => setPrimaryHidden(prev => !prev)}
                            />
                        </TableCellActions>
                    </TableCell>

                    <TableCell>
                        {workingSKey ? <Spinner size={"extra-tiny"} /> : secondaryHidden ? hiddenKey : sub.secondaryKey}
                        <TableCellActions>
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={secondaryHidden ? <EyeRegular /> : <EyeOffRegular />}
                                onClick={() => setSecondaryHidden(prev => !prev)}
                            />
                        </TableCellActions>
                    </TableCell>

                    <TableCell>
                        {subscriptionDateRender(sub)}
                    </TableCell>

                    <TableCell style={{ textAlign: "right" }}>
                        {MenuActions.length > 0 && (
                            <Menu>
                                <MenuTrigger disableButtonEnhancement>
                                    <Button
                                        appearance="transparent"
                                        icon={<MoreHorizontalRegular />}
                                    />
                                </MenuTrigger>

                                <MenuPopover>
                                    <MenuList>
                                        {MenuActions.map(MenuItem => <MenuItem key={MenuItem.toString()} />)}
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                        )}
                    </TableCell>
                  </>
            }
        </TableRow>
    )
}

export const SubscriptionsTable = ({ subscriptions, saveName, cancelSubscription, regeneratePKey, regenerateSKey }: TPropsCommon & { subscriptions: Subscription[] }) => {
    return (
        <InfoTable
            title={"Subscriptions list"}
            columnLabels={["Name", "Product", "State", "Primary key", "Secondary key", "Date created", ""]}
            children={subscriptions.length > 0 &&
                subscriptions.map((sub) => (
                    <SubscriptionRow
                        key={sub.id}
                        sub={sub}
                        saveName={saveName}
                        cancelSubscription={cancelSubscription}
                        regeneratePKey={regeneratePKey}
                        regenerateSKey={regenerateSKey}
                    />
                ))
            }
            noDataMessage="No subscriptions to display"
            className={"profile-subscriptions-table"}
        />
    );
};
