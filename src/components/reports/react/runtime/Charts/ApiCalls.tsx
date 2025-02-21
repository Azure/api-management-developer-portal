import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { DataVizPalette, IChartProps, LineChart } from "@fluentui/react-charting";
import { TReportsChartProps } from "../ReportsRuntime";

const apiCallsLineChartData: IChartProps = {
    chartTitle: "API Calls",
    lineChartData: [
        {
            legend: "Total requests",
            data: [],
            color: DataVizPalette.info
        },
        {
            legend: "Successful requests",
            data: [],
            color: DataVizPalette.success
        },
        {
            legend: "Blocked requests",
            data: [],
            color: DataVizPalette.warning
        },
        {
            legend: "Failed requests",
            data: [],
            color: DataVizPalette.error
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
            <h5 className={"report-chart-title"}>API Calls</h5>
            {reportsByTime.length === 0
                ? <div>No data</div>
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
