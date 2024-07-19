import * as React from "react";
import { Body1Strong, Spinner, Table, TableBody } from "@fluentui/react-components";
import { Headers, TOrderState } from "./Headers";
import { Pagination } from "../../../../utils/react/Pagination";
import * as Constants from "../../../../../constants";

export const ReportsTable = <T extends unknown>({ mainLabel, pageState: [pageNumber, setPageNumber], orderState, data, working, children }: {
    mainLabel: string
    pageState: [number, React.Dispatch<React.SetStateAction<number>>]
    orderState: TOrderState
    data: { value: T[], count: number } | undefined
    working: boolean
    children: (product: T) => JSX.Element
}) => (
    <>
        <Table className={"fui-table"} size={"small"}>
            <Headers mainLabel={mainLabel} orderState={orderState} />

            {!working && data?.value.length > 0 && (
                <TableBody>
                    {data.value.map(children)}
                </TableBody>
            )}
        </Table>

        {working ? (
            <Spinner label={"Loading products"} labelPosition="below" style={{ marginBottom: "1.5rem" }} />
        ) : data?.value.length > 0 ? (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(data?.count / Constants.defaultPageSize)} />
            </div>
        ) : (
            <Body1Strong style={{ display: "block", marginBottom: "2.5rem", textAlign: "center" }}>No data</Body1Strong>
        )}
    </>
)
