import * as React from "react";
import { Body1, Body1Strong, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { TypeOfApi } from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";

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

export const OperationDetailsTable = ({tableName, tableContent, showExamples, showIn}) => (
    <Table aria-label={tableName} className={"fui-table"}>
        <TableHeader>
            <TableRow className={"fui-table-headerRow"}>
                <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                {showIn && <TableHeaderCell><Body1Strong>In</Body1Strong></TableHeaderCell>}
                <TableHeaderCell><Body1Strong>Required</Body1Strong></TableHeaderCell>
                <TableHeaderCell><Body1Strong>Type</Body1Strong></TableHeaderCell>
                <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                {showExamples && <TableHeaderCell><Body1Strong>Example</Body1Strong></TableHeaderCell>} {/** TODO */}
            </TableRow>
        </TableHeader>
        <TableBody>
            {tableContent.map(parameter => (
                <TableRow key={parameter.name} className={"fui-table-body-row"}>
                    <TableCell><Body1>{parameter.name}</Body1></TableCell>
                    {showIn && <TableCell><Body1>{parameter.in}</Body1></TableCell>}
                    <TableCell><Body1>{parameter.required ? "true" : "false"}</Body1></TableCell>
                    <TableCell><Body1>{parameter.type}</Body1></TableCell>
                    <TableCell><Body1><MarkdownProcessor markdownToDisplay={parameter.description} /></Body1></TableCell>
                    {showExamples && <TableCell><Body1></Body1></TableCell>}
                </TableRow>
            ))}
        </TableBody>
    </Table>
)