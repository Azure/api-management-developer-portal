import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { IChartProps, LineChart } from "@fluentui/react-charting";
import { Utils } from "../../../../../utils";
import { TReportsChartProps } from "../ReportsRuntime";

const apiResponseTimeLineChartData: IChartProps = {
    chartTitle: "API Response Time",
    lineChartData: [
        {
            legend: "Minunum response time",
            data: []
        },
        {
            legend: "Average response time",
            data: []
        },
        {
            legend: "Maximum response time",
            data: []
        }
    ]
}

export const ApiResponseTime = ({ reportsByTime, timeRange, dateFormattingFunc }: TReportsChartProps) => {
    const [data, setData] = useState<IChartProps>(apiResponseTimeLineChartData);
    const [forceRerender, setForceRerender] = useState<number>(1);
    const rerender = useCallback(() => setForceRerender(old => old + 1), []);

    useEffect(() => {
        reportsByTime.length > 0 && fillLatencyChart();
    }, [reportsByTime]);

    const fillLatencyChart = async () => {
        const newData = JSON.parse(JSON.stringify(apiResponseTimeLineChartData)); //clone object

        reportsByTime.forEach(report => {
            newData.lineChartData[0].data.push({ x: new Date(report.timestamp), y: report.apiTimeMin });
            newData.lineChartData[1].data.push({ x: new Date(report.timestamp), y: report.apiTimeAvg });
            newData.lineChartData[2].data.push({ x: new Date(report.timestamp), y: report.apiTimeMax });
        });

        setData(newData);
        rerender();
    }
    
    return (
        <div className={"report-chart-container"}>
            <h5 className={"report-chart-title"}>API Response Times</h5>
            {reportsByTime.length === 0
                ? <div>No data</div>
                : <LineChart
                    data={data}
                    xAxisTitle="Time"
                    yAxisTitle="Response times"
                    enablePerfOptimization
                    tickValues={[timeRange.startTime, timeRange.endTime]}
                    customDateTimeFormatter={dateFormattingFunc}
                    yAxisTickFormat={(milliseconds: number) => Utils.formatTimespan(milliseconds)}
                    margins={{ left: 100 }}
                />
            }
        </div>
    );
};
