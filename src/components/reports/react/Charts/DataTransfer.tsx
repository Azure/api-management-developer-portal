import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Body1, Subtitle2Stronger } from "@fluentui/react-components";
import { IChartProps, LineChart } from "@fluentui/react-charting";
import { Utils } from "../../../../utils";
import { TReportsChartProps } from "../ReportsRuntime";

const dataTransferLineChartData: IChartProps = {
    chartTitle: "Data Transfer",
    lineChartData: [
        {
            legend: "Brandwidth",
            data: []
        }
    ]
}

export const DataTransfer = ({ reportsByTime, timeRange, dateFormattingFunc }: TReportsChartProps) => {
    const [data, setData] = useState<IChartProps>(dataTransferLineChartData);
    const [forceRerender, setForceRerender] = useState<number>(1);
    const rerender = useCallback(() => setForceRerender(old => old + 1), []);

    useEffect(() => {
        reportsByTime.length > 0 && fillLatencyChart();
    }, [reportsByTime]);

    const fillLatencyChart = async () => {
        const newData = JSON.parse(JSON.stringify(dataTransferLineChartData)); //clone object

        reportsByTime.forEach(report => {
            newData.lineChartData[0].data.push({ x: new Date(report.timestamp), y: report.bandwidth });
        });

        setData(newData);
        rerender();
    }
    
    return (
        <div className={"report-chart-container"}>
            <Subtitle2Stronger block className={"report-chart-title"}>Data Transfer</Subtitle2Stronger>
            {reportsByTime.length === 0
                ? <Body1 block>No data</Body1>
                : <LineChart
                    data={data}
                    xAxisTitle="Time"
                    yAxisTitle="Brandwidth usage"
                    enablePerfOptimization
                    tickValues={[timeRange.startTime, timeRange.endTime]}
                    customDateTimeFormatter={dateFormattingFunc}
                    yAxisTickFormat={(bytes: number) => Utils.formatBytes(bytes)}
                    margins={{ left: 100 }}
                />
            }
        </div>
    );
};
