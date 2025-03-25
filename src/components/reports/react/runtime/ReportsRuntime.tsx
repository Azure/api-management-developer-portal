import * as React from "react";
import { useEffect, useState } from "react";
import * as moment from "moment/moment";
import { Stack } from "@fluentui/react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { AnalyticsService } from "../../../../services/analyticsService";
import { ReportRecordByTime } from "../../../../contracts/reportRecordByTime";
import * as Constants from "../../../../constants";
import {
    optionsReports,
    optionsReportsCharts,
    optionsReportsTables,
    optionTimeRangeDefault,
    Selectors,
    TimeRange
} from "./Selectors";
import { ApiCalls } from "./Charts/ApiCalls";
import { DataTransfer } from "./Charts/DataTransfer";
import { ApiResponseTime } from "./Charts/ApiResponseTime";
import { Products } from "./Tables/Products";
import { Subscriptions } from "./Tables/Subscriptions";
import { Apis } from "./Tables/Apis";
import { Operations } from "./Tables/Operations";

type ReportsRuntimeProps = {}
type ReportsRuntimeFCProps = ReportsRuntimeProps & {
    analyticsService: AnalyticsService
}

export type TReportsTableProps = {
    analyticsService: AnalyticsService;
    timeRange: TimeRange;
};

export type TReportsChartProps = {
    reportsByTime: ReportRecordByTime[];
    timeRange: TimeRange;
    dateFormattingFunc: (timestamp: Date) => string;
};

const selectedReportsLocalStorageKey = "MS_APIM_DEVPORTAL_selectedReports";

const ReportsRuntimeFC = ({ analyticsService }: ReportsRuntimeFCProps) => {
    const previousSelectedReports = window.localStorage.getItem(selectedReportsLocalStorageKey);
    const [selectedReports, setSelectedReports] = useState<string[]>(previousSelectedReports ? JSON.parse(previousSelectedReports) : optionsReports);
    const [timeRange, setTimeRange] = useState(optionTimeRangeDefault);
    const [reportsByTime, setReportsByTime] = useState<ReportRecordByTime[]>([]);

    useEffect(() => {
        window.localStorage.setItem(
            selectedReportsLocalStorageKey,
            JSON.stringify(selectedReports)
        );
    }, [selectedReports]);

    useEffect(() => {
        getReportsByTime();
    }, [timeRange]);

    const isSelected = (key: keyof typeof optionsReportsCharts | keyof typeof optionsReportsTables) => (
        selectedReports.includes(optionsReportsCharts[key] || optionsReportsTables[key])
    );

    const getReportsByTime = async (): Promise<void> => {
        const { startTime, endTime } = timeRange;
        const differenceTime = endTime.getTime() - startTime.getTime();
        const differenceMinutes = Math.floor(differenceTime / (1000 * 60));

        const maxRecordsToDisplay = 50;
        const intervalMultiplier = 15;
        const intervalInMin = (Math.floor(differenceMinutes / intervalMultiplier / maxRecordsToDisplay) * intervalMultiplier) || intervalMultiplier;

        const reportsByTime = await analyticsService.getReportsByTime(startTime, endTime, intervalInMin);
        setReportsByTime(reportsByTime?.value);
    }

    const formatDate = (): ((timestamp: Date) => string) => {
        const { startTime, endTime } = timeRange;
        const differenceTime = endTime.getTime() - startTime.getTime();
        const differenceHours = Math.floor(differenceTime / (1000 * 60 * 60));
        const differenceDays = Math.floor(differenceTime / (1000 * 3600 * 24));

        let dateFormattingFunc: (timestamp: Date) => string;

        if (differenceDays > 30) {
            dateFormattingFunc = (date: Date) => moment(date).format("MMM");
        }
        else if (differenceDays > 7) {
            dateFormattingFunc = (date: Date) => moment(date).format("M/D");
        }
        else if (differenceHours > 24) {
            dateFormattingFunc = (date: Date) => moment(date).format("M/D");
        }
        else {
            dateFormattingFunc = (date: Date) => moment(date).format("HH:mm");
        }

        return dateFormattingFunc;
    }

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <Selectors selectedReportsState={[selectedReports, setSelectedReports]} setTimeRange={setTimeRange} />

            <div>
                {isSelected("API Calls") && <ApiCalls reportsByTime={reportsByTime} timeRange={timeRange} dateFormattingFunc={formatDate()} />}
                {isSelected("Data transfer") && <DataTransfer reportsByTime={reportsByTime} timeRange={timeRange} dateFormattingFunc={formatDate()} />}
                {isSelected("API response time") && <ApiResponseTime reportsByTime={reportsByTime} timeRange={timeRange} dateFormattingFunc={formatDate()} />}

                {isSelected("Products") && <Products analyticsService={analyticsService} timeRange={timeRange} />}
                {isSelected("Subscriptions") && <Subscriptions analyticsService={analyticsService} timeRange={timeRange} />}
                {isSelected("APIs") && <Apis analyticsService={analyticsService} timeRange={timeRange} />}
                {isSelected("Operations") && <Operations analyticsService={analyticsService} timeRange={timeRange} />}
            </div>
        </Stack>
    );
};

export class ReportsRuntime extends React.Component<ReportsRuntimeProps> {
    @Resolve("analyticsService")
    public analyticsService: AnalyticsService;

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ReportsRuntimeFC
                    {...this.props}
                    analyticsService={this.analyticsService}
                />
            </FluentProvider>
        );
    }
}
