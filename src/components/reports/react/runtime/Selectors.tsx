import * as React from "react";
import * as moment from "moment/moment";
import { Stack } from "@fluentui/react";
import { Dropdown, Option, OptionGroup } from "@fluentui/react-components";

export enum optionsReportsCharts {
    "API Calls" = "apiCalls",
    "Data transfer" = "dataTransfer",
    "API response time" = "apiResponseTime",
}

export enum optionsReportsTables {
    "Products" = "products",
    "Subscriptions" = "subscriptions",
    "APIs" = "apis",
    "Operations" = "operations",
}

export const optionsReports = [
    Object.values(optionsReportsCharts),
    Object.values(optionsReportsTables),
].flat();

const reportsDropdownLabel = (selectedReports: string[]) => {
    if (selectedReports.length === optionsReports.length) return "All reports";
    if (selectedReports.length !== 1)
        return `${selectedReports.length} out of ${optionsReports.length} reports selected`;

    const key = selectedReports[0];
    return Object.entries({
        ...optionsReportsCharts,
        ...optionsReportsTables,
    }).find(([_, value]) => value === key)?.[0];
};

const optionsTime = {
    "1hour": "Last hour",
    "1day": "Today",
    "7days": "Last 7 days",
    "30days": "Last 30 days",
    "90days": "Last 90 days",
};

export type TimeRange = { startTime: Date, endTime: Date };

const getTimeRange1Hour = (): TimeRange => ({
    startTime: moment().subtract(1, "hours").toDate(),
    endTime: moment().toDate(),
});

const getTimeRange1Day = (): TimeRange => ({
    startTime: moment().subtract(1, "days").toDate(),
    endTime: moment().toDate(),
});

const getTimeRange7Days = (): TimeRange => ({
    startTime: moment().subtract(7, "days").toDate(),
    endTime: moment().toDate(),
});

const getTimeRange30Days = (): TimeRange => ({
    startTime: moment().subtract(30, "days").toDate(),
    endTime: moment().toDate(),
});

const getTimeRange90Days = (): TimeRange => ({
    startTime: moment().subtract(90, "days").toDate(),
    endTime: moment().toDate(),
});

export const optionTimeRangeDefault = getTimeRange7Days;
const optionTimeDefault: keyof typeof optionsTime = "7days";

const timeRangeMap: Record<keyof typeof optionsTime, () => TimeRange> = {
    "1hour": getTimeRange1Hour,
    "1day": getTimeRange1Day,
    "7days": getTimeRange7Days,
    "30days": getTimeRange30Days,
    "90days": getTimeRange90Days,
};

type TSelectorsProps = {
    selectedReportsState: [
        string[],
        React.Dispatch<React.SetStateAction<string[]>>
    ];
    setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
};

export const Selectors = ({
    selectedReportsState: [selectedReports, setSelectedReports],
    setTimeRange,
}: TSelectorsProps) => (
    <Stack horizontal tokens={{ childrenGap: 20 }}>
        <Dropdown
            multiselect
            onOptionSelect={(_, data) =>
                setSelectedReports(data.selectedOptions)
            }
            value={reportsDropdownLabel(selectedReports)}
            selectedOptions={selectedReports}
        >
            <OptionGroup label={"Charts"}>
                {Object.entries(optionsReportsCharts).map(([label, value]) => (
                    <Option key={value} value={value}>
                        {label}
                    </Option>
                ))}
            </OptionGroup>
            <OptionGroup label={"Tables"}>
                {Object.entries(optionsReportsTables).map(([label, value]) => (
                    <Option key={value} value={value}>
                        {label}
                    </Option>
                ))}
            </OptionGroup>
        </Dropdown>

        <Dropdown
            onOptionSelect={(_, data) => setTimeRange(timeRangeMap[data.selectedOptions[0]])}
            defaultValue={optionsTime[optionTimeDefault]}
            defaultSelectedOptions={[optionTimeDefault]}
        >
            {Object.entries(optionsTime).map(([value, label]) => (
                <Option key={value} value={value}>
                    {label}
                </Option>
            ))}
        </Dropdown>
    </Stack>
);
