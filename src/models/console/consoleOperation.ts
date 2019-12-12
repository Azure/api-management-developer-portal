import * as ko from "knockout";
import { ConsoleParameter } from "./consoleParameter";
import { ConsoleRequest } from "./consoleRequest";
import { ConsoleResponse } from "./consoleResponse";
import { ConsoleHost } from "./consoleHost";
import { Operation } from "../operation";
import { Api } from "../api";
import { Utils } from "../../utils";
import { ConsoleHeader } from "./consoleHeader";

export class ConsoleOperation {
    private readonly api: Api;
    
    public readonly name: string;
    public readonly method: string;
    public readonly host: ConsoleHost;
    public readonly requestUrl: ko.Computed<string>;
    public readonly templateParameters: ko.ObservableArray<ConsoleParameter>;
    public readonly responses?: ConsoleResponse[];
    public readonly hasBody: boolean;
    public readonly request: ConsoleRequest;
    public urlTemplate: string;

    constructor(api: Api, operation: Operation) {
        this.api = api;
        this.name = operation.displayName;
        this.method = operation.method.toUpperCase();
        this.host = new ConsoleHost();
        this.urlTemplate = operation.urlTemplate;
        this.request = new ConsoleRequest(operation.request);
        this.templateParameters = ko.observableArray(operation.templateParameters.map(parameterContract => new ConsoleParameter(parameterContract)));
        this.hasBody = !["GET", "HEAD", "TRACE"].includes(this.method);

        if (operation.responses) {
            this.responses = operation.responses.map(x => new ConsoleResponse(x));
        }
        else {
            this.responses = [];
        }

        this.requestUrl = ko.computed(() => {
            const protocol = this.api.protocols.indexOf("https") !== -1 ? "https" : "http";
            const urlTemplate = this.getRequestPath();
            const result = `${protocol}://${this.host.hostname()}${Utils.ensureLeadingSlash(urlTemplate)}`;

            return result;
        });
    }

    private addParam(uri: string, name: string, value: string): string {
        const separator = uri.indexOf("?") >= 0 ? "&" : "?";
        const paramString = !value || value === "" ? name : name + "=" + value;

        return uri + separator + paramString;
    }

    public setHeader(name: string, value: string, type: string = "string", description?: string): ConsoleHeader {
        const header = this.createHeader(name, value, type, description);

        this.request.headers.push(header);

        return header;
    }

    public createHeader(name: string, value: string, type: string, description: string): ConsoleHeader {
        const header = new ConsoleHeader();
        header.name(name);
        header.value(value);
        header.type = type;
        header.description = description;

        return header;
    }

    private getRequestPath(): string {
        let versionPath = "";
        const revision = "";

        if (this.api.apiVersionSet && this.api.apiVersion && this.api.apiVersionSet.versioningScheme === "Segment") {
            versionPath = `/${this.api.apiVersion}`;
        }

        let requestUrl = this.urlTemplate;
        const parameters = this.templateParameters().concat(this.request.queryParameters());

        parameters.forEach(parameter => {
            if (parameter.value()) {
                const parameterPlaceholder = `{${parameter.name}}`;
                const parameterValue = encodeURIComponent(parameter.value());

                if (requestUrl.indexOf(parameterPlaceholder) > -1) {
                    requestUrl = requestUrl.replace(parameterPlaceholder, parameterValue);
                }
                else {
                    requestUrl = this.addParam(requestUrl, parameter.name, parameterValue);
                }
            }
        });

        if (this.api.apiVersionSet && this.api.apiVersionSet.versioningScheme === "Query") {
            requestUrl = this.addParam(requestUrl, this.api.apiVersionSet.versionQueryName, this.api.apiVersion);
        }

        return `${this.api.path}${versionPath}${revision}${requestUrl}`;
    }
}