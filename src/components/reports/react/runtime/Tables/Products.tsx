import * as React from "react";
import { TableCell, TableRow } from "@fluentui/react-components";
import { AnalyticsService } from "../../../../../services/analyticsService";
import { ReportQuery } from "../../../../../services/reportQuery";
import * as Constants from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { useLoadData } from "../utils";
import { TReportsTableProps } from "../ReportsRuntime";
import { orderDefault } from "./shared/Headers";
import { ReportsTable } from "./shared/ReportsTable";

const getProductsData = async (
    analyticsService: AnalyticsService,
    startTime: Date,
    endTime: Date,
    pageNumber: number,
    orderBy: string,
    orderAscending: boolean
) => {
    const query: ReportQuery = {
        startTime,
        endTime,
        skip: (pageNumber - 1) * Constants.defaultPageSize,
        take: Constants.defaultPageSize,
        orderBy,
        orderDirection: orderAscending ? Constants.Direction.asc : Constants.Direction.desc,
    };

    const pageOfRecords = await analyticsService.getReportsByProduct(query);

    const value = pageOfRecords.value.map((contract) => ({
        ...contract,
        callCountSuccess: Utils.formatNumber(contract.callCountSuccess),
        callCountBlocked: Utils.formatNumber(contract.callCountBlocked),
        callCountFailed: Utils.formatNumber(contract.callCountFailed),
        callCountOther: Utils.formatNumber(contract.callCountOther),
        callCountTotal: Utils.formatNumber(contract.callCountTotal),
        apiTimeAvg: Utils.formatTimespan(contract.apiTimeAvg),
        bandwidth: Utils.formatBytes(contract.bandwidth),
    }));

    return {
        ...pageOfRecords,
        value,
    };
};

export const Products = ({ analyticsService, timeRange: { startTime, endTime } }: TReportsTableProps) => {
    const [order, setOrder] = React.useState(orderDefault);
    const [page, setPage] = React.useState(1);
    const {data, working} = useLoadData(getProductsData, [analyticsService, startTime, endTime, page, order.key, order.ascending]);

    return (
        <ReportsTable mainLabel={"Products"} orderState={[order, setOrder]} pageState={[page, setPage]} data={data} working={working}>
            {product => (
                <TableRow key={product.name}>
                    <TableCell><span className="strong">{product.name}</span></TableCell>
                    <TableCell>{product.callCountSuccess}</TableCell>
                    <TableCell>{product.callCountBlocked}</TableCell>
                    <TableCell>{product.callCountFailed}</TableCell>
                    <TableCell>{product.callCountOther}</TableCell>
                    <TableCell>{product.callCountTotal}</TableCell>
                    <TableCell>{product.apiTimeAvg}</TableCell>
                    <TableCell>{product.bandwidth}</TableCell>
                </TableRow>
            )}
        </ReportsTable>
    );
};
