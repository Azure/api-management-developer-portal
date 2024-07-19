import * as React from "react";
import { useEffect } from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { AnalyticsService } from "../../../services/analyticsService";
import * as Constants from "../../../constants";
import {
    optionsReports,
    optionsReportsCharts,
    optionsReportsTables,
    optionTimeRangeDefault,
    Selectors
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

const selectedReportsLocalStorageKey = "MS_APIM_DEVPORTAL_selectedReports" // TODO better key

const ReportsRuntimeFC = ({ analyticsService }: ReportsRuntimeFCProps) => {
    const previousSelectedReports = window.localStorage.getItem(selectedReportsLocalStorageKey);
    const [selectedReports, setSelectedReports] = React.useState<string[]>(previousSelectedReports ? JSON.parse(previousSelectedReports) : optionsReports);
    const [timeRange, setTimeRange] = React.useState(optionTimeRangeDefault);

    useEffect(() => {
        window.localStorage.setItem(
            selectedReportsLocalStorageKey,
            JSON.stringify(selectedReports)
        );
    }, [selectedReports]);

    const isSelected = (key: keyof typeof optionsReportsCharts | keyof typeof optionsReportsTables) => (
        selectedReports.includes(optionsReportsCharts[key] || optionsReportsTables[key])
    );

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <Selectors selectedReportsState={[selectedReports, setSelectedReports]} setTimeRange={setTimeRange} />

            <div>
                {isSelected("API Calls") && <ApiCalls />}
                {isSelected("Data transfer") && <DataTransfer />}
                {isSelected("API response time") && <ApiResponseTime />}

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
