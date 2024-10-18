import * as React from "react";
import {
    Body1Strong,
    Body1Stronger,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";

type TOrder = {
    key: string
    ascending: boolean
}

export type TOrderState = [
    TOrder,
    React.Dispatch<React.SetStateAction<TOrder>>
]

export const orderDefault: TOrder = { key: "name", ascending: false }

const onSort = (setOrder: TOrderState[1], key: string) => setOrder(old => {
    if (old.key === key) {
        return { key, ascending: !old.ascending };
    } else {
        return { key, ascending: false };
    }
});

type TMyHeaderCellProps = React.ComponentProps<typeof TableHeaderCell> & { sortKey: string; orderState: TOrderState }

const MyHeaderCell = ({ sortKey, orderState: [order, setOrder], ...props }: TMyHeaderCellProps) => (
    <TableHeaderCell
        {...props}
        sortable
        sortDirection={order.key === sortKey ? order.ascending ? "ascending" : "descending" : undefined}
        onClick={() => onSort(setOrder, sortKey)}
    >
    {props.children}
    </TableHeaderCell>
);

type THeadersProps = {
    mainLabel: string
    orderState: TOrderState
}

export const Headers = ({ mainLabel, orderState }: THeadersProps) => (
    <TableHeader>
        <TableRow className={"fui-table-headerRow"}>
            <MyHeaderCell orderState={orderState} sortKey={"name"}>
                <Body1Stronger>{mainLabel}</Body1Stronger>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountSuccess"}>
                <Body1Strong>Successful calls</Body1Strong>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountBlocked"}>
                <Body1Strong>Blocked calls</Body1Strong>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountFailed"}>
                <Body1Strong>Failed calls</Body1Strong>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountOther"}>
                <Body1Strong>Other calls</Body1Strong>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountTotal"}>
                <Body1Strong>Total calls</Body1Strong>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"apiTimeAvg"}>
                <Body1Strong>Response time</Body1Strong>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"bandwidth"}>
                <Body1Strong>Bandwidth</Body1Strong>
            </MyHeaderCell>
        </TableRow>
    </TableHeader>
);
