import * as React from "react";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { TypeOfApi } from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

export const scrollToOperation = (): void => {
    const headerElement = document.getElementById("operation");
    headerElement && headerElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
}

export const getRequestUrl = (api: Api, operation: Operation, hostname: string): string => {
    if ((!api || !operation) && api?.type !== TypeOfApi.graphQL) {
        return null;
    }

    let operationPath = api.versionedPath;

    if (api.type !== TypeOfApi.soap && api.type !== TypeOfApi.graphQL) {
        operationPath += operation.displayUrlTemplate;
    }

    let requestUrl = "";

    if (hostname && api.type !== TypeOfApi.webSocket) {
        requestUrl = (api.protocols?.[0] ?? "https") + "://";
    }

    if (hostname) requestUrl += hostname;

    requestUrl += Utils.ensureLeadingSlash(operationPath);

    if (api.apiVersion && api.apiVersionSet?.versioningScheme === "Query") {
        return Utils.addQueryParameter(requestUrl, api.apiVersionSet.versionQueryName, api.apiVersion);
    }

    return requestUrl;
}

const displayExamples = (examples, isHeaders: boolean): JSX.Element => {
    if (examples.length === 0) return <span></span>;

    if (isHeaders) {
        return (
            <div className="td-example">
                {examples.map((example, index) => (
                    <React.Fragment key={index}>
                        <span>{example.title}:</span><span>{example.value}</span>
                        <div>{example.description}</div>
                    </React.Fragment>
                ))}
            </div>
        )
    }

    return (
        <div className="td-example">
            {examples.map((example, index) => (
                <React.Fragment key={index}>
                    {example.title !== "default" && <span>{example.title}:</span>}
                    <span>{example.value}</span>
                    <div>{example.description}</div>
                </React.Fragment>
            ))}
        </div>
    )
}

export const OperationDetailsTable = ({tableName, tableContent, showExamples, showIn, isHeaders = false}) => (
    <Table aria-label={tableName} className={"fui-table"}>
        <TableHeader>
            <TableRow className={"fui-table-headerRow"}>
                <TableHeaderCell><span className="strong">Name</span></TableHeaderCell>
                {showIn && <TableHeaderCell><span className="strong">In</span></TableHeaderCell>}
                <TableHeaderCell><span className="strong">Required</span></TableHeaderCell>
                <TableHeaderCell><span className="strong">Type</span></TableHeaderCell>
                <TableHeaderCell><span className="strong">Description</span></TableHeaderCell>
                {showExamples && <TableHeaderCell><span className="strong">Example</span></TableHeaderCell>}{/** TODO */}
            </TableRow>
        </TableHeader>
        <TableBody>
            {tableContent.map(parameter => (
                <TableRow key={parameter.name} className={"fui-table-body-row"}>
                    <TableCell><span>{parameter.name}</span></TableCell>
                    {showIn && <TableCell><span>{parameter.in}</span></TableCell>}
                    <TableCell><span>{parameter.required ? "true" : "false"}</span></TableCell>
                    <TableCell><span>{parameter.type}</span></TableCell>
                    <TableCell><div><MarkdownProcessor markdownToDisplay={parameter.description} /></div></TableCell>
                    {showExamples && <TableCell>{parameter.examples && displayExamples(parameter.examples, isHeaders)}</TableCell>}
                </TableRow>
            ))}
        </TableBody>
    </Table>
)