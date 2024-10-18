import * as React from "react";
import { Spinner, Table, TableBody } from "@fluentui/react-components";
import { Pagination } from "../../../../utils/react/Pagination";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import * as Constants from "../../../../../constants";
import { Headers, TOrderState } from "./Headers";

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

            {!working && (
                <TableBody>
                    {data?.value.length > 0
                        ? data.value.map(children)
                        : <NoRecordsRow colspan={8} customText="No data" />
                    }
                </TableBody>
            )}
        </Table>

        {working ? (
            <Spinner label={"Loading products"} labelPosition="below" style={{ marginBottom: "1.5rem" }} size="small" />
        ) : data?.value.length > 0 && (
            <div className={"pagination-container"}>
                <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(data?.count / Constants.defaultPageSize)} />
            </div>
        )}
    </>
)
