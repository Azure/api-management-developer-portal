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

const getApisData = async (
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

    const pageOfRecords = await analyticsService.getReportsBySubscription(query);

    const value = pageOfRecords.value.map((contract) => ({
        ...contract,
        name: contract.name || "< Unnamed >",
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

export const Subscriptions = ({ analyticsService, timeRange: { startTime, endTime } }: TProductsProps) => {
    const [order, setOrder] = React.useState(orderDefault);
    const [page, setPage] = React.useState(1);
    const {data, working} = useLoadData(getApisData, [analyticsService, startTime, endTime, page, order.key, order.ascending]);

    return (
        <ReportsTable mainLabel={"Subscriptions"} orderState={[order, setOrder]} pageState={[page, setPage]} data={data} working={working}>
            {api => (
                <TableRow key={api.name}>
                    <TableHeaderCell>
                        <Body1Strong>{api.name}</Body1Strong>
                    </TableHeaderCell>
                    <TableHeaderCell>{api.callCountSuccess}</TableHeaderCell>
                    <TableHeaderCell>{api.callCountBlocked}</TableHeaderCell>
                    <TableHeaderCell>{api.callCountFailed}</TableHeaderCell>
                    <TableHeaderCell>{api.callCountOther}</TableHeaderCell>
                    <TableHeaderCell>{api.callCountTotal}</TableHeaderCell>
                    <TableHeaderCell>{api.apiTimeAvg}</TableHeaderCell>
                    <TableHeaderCell>{api.bandwidth}</TableHeaderCell>
                </TableRow>
            )}
        </ReportsTable>
    );
};
