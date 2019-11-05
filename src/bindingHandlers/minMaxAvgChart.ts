import * as ko from "knockout";
import * as d3 from "d3";
import { MinMaxAvgChartConfig } from "../components/reports/minMaxAvgChart/minMaxAvgChartConfig";
import { MinMaxAvgChartRecord } from "../components/reports/minMaxAvgChart/minMaxAvgChartRecord";


ko.bindingHandlers["minMaxAvgChart"] = {
    update: (element: HTMLElement, valueAccessor: () => MinMaxAvgChartConfig): void => {
        const configuration = ko.unwrap(valueAccessor());

        if (!configuration) {
            return;
        }

        element.childNodes.forEach(x => x.remove());

        const minMaxAreaColor = "#ddd";
        const avgLineColor = "#1786d8";

        const dimensions =  [{
            displayName: "Max",
            key: "max",
            color: minMaxAreaColor
        },
        {
            displayName: "Avg",
            key: "avg",
            color: "#7fba00"
        },
        {
            displayName: "Min",
            key: "min",
            color: minMaxAreaColor
        }];

        const legendRowHeight = 40;
        const legendColumnWidth = 250;
        const legendLines = Math.ceil(dimensions.length / 2);
        const legendPadding = 20;
        const width = 700;
        const height = 380;
        const margin = ({ top: 20, right: 0, bottom: 30 + (legendLines * legendRowHeight), left: 70 });
        const fontSize = 15;
        const verticalLineTooltipWidth = 120;
        const verticalLineTooltipHeight = 40;
        const defaultFormat = (value: any) => value;
        const formatX = configuration.formatX || defaultFormat;
        const formatXDetailed = configuration.formatXDetailed || formatX || defaultFormat;
        const formatY = configuration.formatY || defaultFormat;
        const formatYDetailed = configuration.formatYDetailed || formatY || defaultFormat;

        const svg = d3
            .create("svg")
            .attr("viewBox", [0, 0, width, height]);

        /* Axis X */
        const x = d3.scaleTime()
            .domain([configuration.startTime, configuration.endTime])
            .range([margin.left, width - margin.right]);

        const xAxis = g => g
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .style("font-size", fontSize)
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickSizeOuter(0)
                .tickFormat(formatX)
            );

        svg.append("g")
            .call(xAxis);


        /* Axis Y */
        const y = d3.scaleLinear()
            .domain([0, d3.max(configuration.records, records => records.avg)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .style("font-size", fontSize)
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(formatY)
            )
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .call(yAxis);


        /* Area */
        const area = d3.area()
            .x((record: MinMaxAvgChartRecord) => x(record.timestamp))
            .y0((record: MinMaxAvgChartRecord) => y(record.max))
            .y1((record: MinMaxAvgChartRecord) => y(record.min))
            .curve(d3.curveNatural);

        svg.append("path")
            .attr("d", area(configuration.records))
            .attr("fill", minMaxAreaColor);


        /* Line */
        const line = d3.line()
            .x((record: MinMaxAvgChartRecord) => { return x(record.timestamp); })
            .y((record: MinMaxAvgChartRecord) => y(record.avg))
            .curve(d3.curveLinear);

        svg.append("path")
            .attr("d", line(configuration.records))
            .attr("stroke", avgLineColor)
            .attr("fill", "none")
            .attr("stroke-width", 2);


        

        for (let i = 0; i < dimensions.length; i++) {
            const dimension = dimensions[i];

            const legendColumnNum = 2;
            const legendRow = Math.floor(i / legendColumnNum);
            const legendColumn = Math.floor(i / ((legendRow * legendColumnNum) + 1));

            svg.append("rect")
                .attr("x", (legendColumn * legendColumnWidth) + margin.left)
                .attr("y", height - (legendLines * legendRowHeight) + (legendRow * legendRowHeight) + legendPadding)
                .attr("width", 20)
                .attr("height", 20)
                .style("fill", dimension.color);

            svg.append("text")
                .attr("x", (legendColumn * legendColumnWidth) + margin.left + 25)
                .attr("y", height - (legendLines * legendRowHeight) + (legendRow * legendRowHeight) + 12 + legendPadding)
                .text(dimension.displayName)
                .style("font-size", fontSize)
                .attr("alignment-baseline", "middle");

            const legendNode = svg.append("text")
                .attr("x", (legendColumn * legendColumnWidth) + margin.left + 25 + legendColumnWidth - 50)
                .attr("y", height - (legendLines * legendRowHeight) + (legendRow * legendRowHeight) + 12 + legendPadding)
                .text("-")
                .style("font-size", fontSize)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "middle");

            dimension["legend"] = legendNode;
        }


        /* Vertical line (that follows mouse) */
        const verticalLine = svg.append("path")
            .attr("class", "mouse-line")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        /* Container for tooltip (under vertical line) */
        const verticalLineTooltip = svg
            .append("rect")
            .attr("width", verticalLineTooltipWidth)
            .attr("height", verticalLineTooltipHeight)
            .attr("fill", "black")
            .attr("y", height - margin.bottom)
            .style("opacity", "0");

        /* Container for tooltip text */
        const verticalLineTooltipText = svg.append("text")
            .attr("fill", "#ffffff")
            .attr("y", height - margin.bottom + 20)
            .attr("text-anchor", "middle")
            .style("font-size", fontSize)
            .attr("alignment-baseline", "middle");

        const bisect = d3.bisector((record: any) => { return record.timestamp; }).left;

        /* Mouse tracking rectangle */
        svg.append("rect") // append a rect to catch mouse movements on canvas
            .attr("x", margin.left)
            .attr("width", width) // can't catch mouse events on a g element
            .attr("height", height - margin.bottom)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseout", () => { // on mouse out hide line, circles and text
                verticalLine.style("opacity", "0");
                verticalLineTooltip.style("opacity", "0");
            })
            .on("mouseover", () => { // on mouse in show line, circles and text
                verticalLine.style("opacity", "1");
                verticalLineTooltip.style("opacity", "1");
            })
            .on("mousemove", () => { // mouse moving over canvas
                const mouse = d3.mouse(chartSvgNode);
                const mouseX = mouse[0];

                verticalLine
                    .attr("d", () => {
                        let d = "M" + mouseX + "," + (height - margin.bottom);
                        d += " " + mouseX + "," + 0;
                        return d;
                    });

                let mouseLineTextX = mouseX - verticalLineTooltipWidth / 2;

                if (mouseLineTextX < margin.left) {
                    mouseLineTextX = margin.left;
                }

                if (mouseLineTextX > width - margin.right - verticalLineTooltipWidth) {
                    mouseLineTextX = width - margin.right - verticalLineTooltipWidth;
                }

                verticalLineTooltip
                    .attr("x", mouseLineTextX);

                verticalLineTooltipText
                    .attr("x", mouseLineTextX + (verticalLineTooltipWidth / 2));

                const timestamp = x.invert(mouseX);
                const recordIndex = bisect(configuration.records, timestamp);

                const record = configuration.records[recordIndex];

                for (const dimension of dimensions) {
                    const legendNode = dimension["legend"];

                    if (legendNode) {
                        if (record) {
                            const value = record[dimension.key];
                            legendNode.text(formatY(value));
                        }
                        else {
                            legendNode.text(undefined);
                        }
                    }
                }

                verticalLineTooltipText.text(formatXDetailed(timestamp))
            });


        /* Rendering */
        const chartSvgNode = svg.node();
        element.appendChild(chartSvgNode);
    }
};