import * as ko from "knockout";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { worldMapShapes, countryCodeMappings } from "../components/reports/mapChart/worldMapShapes";
import { MapChartConfig } from "../components/reports/mapChart/mapChartConfig";


ko.bindingHandlers["mapChart"] = {
    update: (element: HTMLElement, valueAccessor: () => MapChartConfig): void => {
        const configuration = ko.unwrap(valueAccessor());

        element.childNodes.forEach(x => x.remove());

        if (!configuration) {
            return;
        }

        const records = configuration.records.map(x => {
            return { key: countryCodeMappings[x.countryCode], heat: x.heat };
        });

        const defaultFormat = (value: any) => value;
        const formatHeat = configuration.formatHeat || defaultFormat;
        const palette = ["#e8f3fb", "#d1e7f7", "#b9dbf3", "#a2cfef", "#8bc3eb", "#74b6e8", "#5daae4", "#469ee0", "#2e92dc", "#1786d8"];
        const width = 450;
        const height = 350;
        const offsetY = -60;
        const offsetX = 10;
        const legendTextWidth = 80;
        const heatBarHeight = 15;
        const fontSize = 15;

        let minHeat = 0;
        const quantiles = {};

        const projection = d3.geoMercator()
            .scale((width + 1) / 2 / Math.PI)
            .translate([width / 2, height / 2])
            .precision(.1);

        const path = d3.geoPath().projection(projection);

        const svg = d3.select(element)
            .append("svg")
            .attr("viewBox", [offsetX, offsetY, width, height])
            .append("g");

        const defs = svg.append("defs");

        const filter = defs
            .append("filter")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 1)
            .attr("height", 1)
            .attr("padding", 10)
            .attr("id", "tooltip");

        filter.append("feFlood")
            .attr("flood-color", "#f2f2f2")
            .attr("result", "COLOR");

        filter.append("feMorphology")
            .attr("operator", "dilate")
            .attr("radius", ".9")
            .attr("in", "SourceAlpha")
            .attr("result", "MORPHED");

        filter.append("feComposite")
            .attr("in", "SourceGraphic")
            .attr("in2", "MORPHED")
            .attr("result", "COMP1");

        filter.append("feComposite")
            .attr("in", "COMP1")
            .attr("in2", "COLOR");

        // TODO: Uncomment if graticule needed.
        // const graticule = d3.geoGraticule();
        // svg.append("path")
        //     .datum(graticule)
        //     .attr("class", "graticule")
        //     .attr("d", path);

        const onMouseOver = (datum, index): void => {
            d3.selectAll(".subunit-label.la" + datum.id + datum.properties.name.replace(/[ \.#']+/g, ""))
                .style("display", "inline-block");

            d3.selectAll(".subunit.ca" + datum.id)
                .style("stroke", "#8e8e8e")
                .style("stroke-width", "1px");
        };

        const onMouseOut = (datum: any, index: number): void => {
            d3.selectAll(".subunit-label.la" + datum.id + datum.properties.name.replace(/[ \.#']+/g, ""))
                .style("display", "none");

            d3.selectAll(".subunit.ca" + datum.id)
                .style("fill", heatColor(datum))
                .style("stroke", "none");
        };

        const heatColor = (geometry: any): string => {
            if (quantiles["0.95"] === 0 && minHeat === 0) {
                return "#F0F0F0";
            }

            if (!geometry.properties.heat) {
                return "#F0F0F0";
            }

            if (geometry.properties.heat > quantiles["0.95"]) {
                return palette[(palette.length - 1)];
            }

            if (quantiles["0.95"] === minHeat) {
                return palette[(palette.length - 1)];
            }

            const diffHeat = quantiles["0.95"] - minHeat;
            const paletteInterval = diffHeat / palette.length;
            const diffHeatDatum = quantiles["0.95"] - geometry.properties.heat;
            const diffDatumDiffHeat = diffHeat - diffHeatDatum;

            let approxIdx = diffDatumDiffHeat / paletteInterval;

            if (!approxIdx || Math.floor(approxIdx) === 0) {
                approxIdx = 0;
            }
            else {
                approxIdx = Math.floor(approxIdx) - 1;
            }
            return palette[approxIdx];
        };

        for (const record of records) {
            const cCode = record.key.toUpperCase();
            const heat = record.heat;

            for (const geometry of worldMapShapes.objects.subunits.geometries) {
                const cName = geometry.id.toUpperCase();

                if (cCode === cName) {
                    geometry.properties["heat"] = heat;
                }
            }
        }

        const subunits = topojson.feature(worldMapShapes, worldMapShapes.objects.subunits);
        subunits.features = subunits.features.filter((d) => d.id !== "ATA");

        minHeat = d3.min(subunits.features, (d) => d.properties.heat);
        const maxHeat = d3.max(subunits.features, (d) => d.properties.heat);

        let heats = subunits.features.map((d) => { return d.properties.heat; });
        heats = heats.filter((d) => d).sort(d3.ascending);

        quantiles["0.95"] = d3.quantile(heats, "0.95");

        const countries = svg.selectAll("path.subunit")
            .data(subunits.features).enter();

        countries.insert("path", ".graticule")
            .attr("class", (record) => "subunit ca" + record.id)
            .style("fill", heatColor)
            .attr("d", path)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);

        countries.append("text")
            .attr("class", (record) => "subunit-label la" + record.id + record.properties.name.replace(/[ \.#']+/g, ""))
            .attr("transform", (record) => "translate(" + (width - (5 * record.properties.name.length)) + "," + (15) + ")")
            .attr("dy", ".35em")
            // .attr("filter", "url(#tooltip)")
            .append("svg:tspan")
            .attr("x", 0)
            .attr("dy", 5)
            .text((record) => record.properties.name)
            .append("svg:tspan")
            .attr("x", 0)
            .attr("dy", 20)
            .text((record) => record.properties.heat
                ? formatHeat(record.properties.heat)
                : "");

        const gradient = defs.append("linearGradient")
            .attr("id", "heatGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "50%")
            .attr("y2", "50%");

        gradient.append("stop")
            .attr("class", "start")
            .attr("offset", "0%")
            .attr("stop-color", palette[0])
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("class", "end")
            .attr("offset", "100%")
            .attr("stop-color", palette[palette.length - 1])
            .attr("stop-opacity", 1);

        svg.append("rect")
            .attr("x", legendTextWidth)
            .attr("y", height - 80)
            .attr("width", width - (legendTextWidth * 2))
            .attr("height", heatBarHeight)
            .style("fill", "url(#heatGradient)");

        const legendTextPadding = 10;

        svg.append("text")
            .attr("x", legendTextWidth - legendTextPadding)
            .attr("y", height - 71)
            .attr("text-anchor", "end")
            .text("0")
            .style("font-size", fontSize)
            .style("text-align", "right")
            .attr("alignment-baseline", "middle");

        svg.append("text")
            .attr("x", width - legendTextWidth + legendTextPadding)
            .attr("y", height - 71)
            .attr("width", legendTextWidth)
            .text(formatHeat(maxHeat))
            .style("font-size", fontSize)
            .attr("alignment-baseline", "middle");
    }
};
