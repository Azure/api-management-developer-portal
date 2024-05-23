import * as React from "react";
import { useEffect, useState } from "react";
import { TypeOfApi } from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";

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