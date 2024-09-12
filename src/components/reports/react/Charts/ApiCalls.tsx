import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Body1, Subtitle2Stronger } from "@fluentui/react-components";
import { IChartProps, LineChart } from "@fluentui/react-charting";
import { TReportsChartProps } from "../ReportsRuntime";

const apiCallsLineChartData: IChartProps = {
    chartTitle: "API Calls",
    lineChartData: [
        {
            legend: "Total requests",
            data: []
        },
        {
            legend: "Successful requests",
            data: []
        },
        {
            legend: "Blocked requests",
            data: []
        },
        {
            legend: "Failed requests",
            data: []
        }
    ]
}

export const ApiCalls = ({ reportsByTime, timeRange, dateFormattingFunc }: TReportsChartProps) => {
    const [data, setData] = useState<IChartProps>(apiCallsLineChartData);
    const [forceRerender, setForceRerender] = useState<number>(1);
    const rerender = useCallback(() => setForceRerender(old => old + 1), []);

    useEffect(() => {
        reportsByTime.length > 0 && fillApiCallsChart();
    }, [reportsByTime]);

    const fillApiCallsChart = async () => {
        const newData = JSON.parse(JSON.stringify(apiCallsLineChartData)); //clone object

        reportsByTime.forEach(report => {
            newData.lineChartData[0].data.push({ x: new Date(report.timestamp), y: report.callCountTotal });
            newData.lineChartData[1].data.push({ x: new Date(report.timestamp), y: report.callCountSuccess });
            newData.lineChartData[2].data.push({ x: new Date(report.timestamp), y: report.callCountBlocked });
            newData.lineChartData[3].data.push({ x: new Date(report.timestamp), y: report.callCountFailed });
        });

        setData(newData);
        rerender();
    }
    
    return (
        <div className={"report-chart-container"}>
            <Subtitle2Stronger block className={"report-chart-title"}>API Calls</Subtitle2Stronger>
            {reportsByTime.length === 0
                ? <Body1 block>No data</Body1>
                : <LineChart
                    data={data}
                    xAxisTitle="Time"
                    yAxisTitle="API Calls"
                    enablePerfOptimization
                    tickValues={[timeRange.startTime, timeRange.endTime]}
                    customDateTimeFormatter={dateFormattingFunc}
                    margins={{ left: 100 }}
                />
            }
        </div>
    );
};
