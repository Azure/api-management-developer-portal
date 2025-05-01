import * as React from "react";
import { ParametersTable } from "@microsoft/api-docs-ui";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { TypeOfApi } from "../../../../../constants";
import { Utils } from "../../../../../utils";

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

export const OperationDetailsTable = ({tableName, tableContent, showExamples, showIn}) => {
    const hiddenColumns: string[] = ["readOnly"];
    !showIn && hiddenColumns.push("in");
    !showExamples && hiddenColumns.push("examples");

    return (
        <ParametersTable
            parameters={tableContent}
            hiddenColumns={hiddenColumns}
            title={tableName}
        />
    );
}