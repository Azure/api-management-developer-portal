import * as React from "react";
import { TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";

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
                <span className="stronger">{mainLabel}</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountSuccess"}>
                <span className="strong">Successful calls</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountBlocked"}>
                <span className="strong">Blocked calls</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountFailed"}>
                <span className="strong">Failed calls</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountOther"}>
                <span className="strong">Other calls</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"callCountTotal"}>
                <span className="strong">Total calls</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"apiTimeAvg"}>
                <span className="strong">Response time</span>
            </MyHeaderCell>
            <MyHeaderCell orderState={orderState} sortKey={"bandwidth"}>
                <span className="strong">Bandwidth</span>
            </MyHeaderCell>
        </TableRow>
    </TableHeader>
);
