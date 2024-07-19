import * as React from "react";
import {
    Body1Strong,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { orderDefault } from "./shared/Headers";
import { ReportQuery } from "../../../../services/reportQuery";
import * as Constants from "../../../../constants";
import { Utils } from "../../../../utils";
import { AnalyticsService } from "../../../../services/analyticsService";
import { useLoadData } from "../utils";
import { TimeRange } from "../Selectors";
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

type TProductsProps = {
    analyticsService: AnalyticsService;
    timeRange: TimeRange;
};

export const Products = ({ analyticsService, timeRange: { startTime, endTime } }: TProductsProps) => {
    const [order, setOrder] = React.useState(orderDefault);
    const [page, setPage] = React.useState(1);
    const {data, working} = useLoadData(getProductsData, [analyticsService, startTime, endTime, page, order.key, order.ascending]);

    return (
        <ReportsTable mainLabel={"Products"} orderState={[order, setOrder]} pageState={[page, setPage]} data={data} working={working}>
            {product => (
                <TableRow key={product.name}>
                    <TableHeaderCell>
                        <Body1Strong>{product.name}</Body1Strong>
                    </TableHeaderCell>
                    <TableHeaderCell>{product.callCountSuccess}</TableHeaderCell>
                    <TableHeaderCell>{product.callCountBlocked}</TableHeaderCell>
                    <TableHeaderCell>{product.callCountFailed}</TableHeaderCell>
                    <TableHeaderCell>{product.callCountOther}</TableHeaderCell>
                    <TableHeaderCell>{product.callCountTotal}</TableHeaderCell>
                    <TableHeaderCell>{product.apiTimeAvg}</TableHeaderCell>
                    <TableHeaderCell>{product.bandwidth}</TableHeaderCell>
                </TableRow>
            )}
        </ReportsTable>
    );
};
