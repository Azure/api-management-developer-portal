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

    public readonly operationName: string;
    public readonly name: string;
    public readonly method: string;
    public readonly host: ConsoleHost;
    public readonly requestUrl: ko.Computed<string>;
    public readonly wsUrl: ko.Computed<string>;
    public readonly templateParameters: ko.ObservableArray<ConsoleParameter>;
    public readonly responses?: ConsoleResponse[];
    public readonly hasBody: ko.Observable<boolean>;
    public readonly request: ConsoleRequest;
    public urlTemplate: string;
    public readonly hiddenWsUrl: ko.Computed<string>;
    public readonly canHaveBody: boolean;

    constructor(api: Api, operation: Operation) {
        this.api = api;
        this.name = operation.displayName;
        this.operationName = operation.name;
        this.method = operation.method.toUpperCase();
        this.host = new ConsoleHost();
        this.urlTemplate = operation.urlTemplate;
        this.request = new ConsoleRequest(operation.request);
        this.templateParameters = ko.observableArray(operation.templateParameters.map(parameterContract => new ConsoleParameter(parameterContract)));
        this.hasBody = ko.observable(operation.request.representations.length > 0);
        this.canHaveBody = !["GET", "HEAD", "TRACE"].includes(this.method);

        if (operation.responses) {
            this.responses = operation.responses.map(x => new ConsoleResponse(x));
        }
        else {
            this.responses = [];
        }

        if (this.urlTemplate.includes("/*")) {
            const templateParameter = new ConsoleParameter();
            templateParameter.name("*");
            this.templateParameters.push(templateParameter);
        }

        this.requestUrl = ko.computed(() => {
            const protocol = this.api.protocols.indexOf("https") !== -1 ? "https" : "http";
            const urlTemplate = this.getRequestPath();
            let result = this.host.hostname() ? `${protocol}://${this.host.hostname()}` : "";
            result += Utils.ensureLeadingSlash(urlTemplate);

            return result;
        });

        this.wsUrl = ko.computed(() => {
            const protocol = this.api.protocols.indexOf("wss") !== -1 ? "wss" : "wss";
            const urlTemplate = this.getRequestPath();
            const result = `${protocol}://${this.host.hostname()}${Utils.ensureLeadingSlash(urlTemplate)}`;

            return result;
        });

        this.hiddenWsUrl = ko.computed(() => {
            const protocol = this.api.protocols.indexOf("wss") !== -1 ? "wss" : "wss";
            const urlTemplate = this.getRequestPath(true);
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

    private getRequestPath(getHidden: boolean = false): string {
        let versionPath = "";

        if (this.api.apiVersionSet && this.api.apiVersion && this.api.apiVersionSet.versioningScheme === "Segment") {
            versionPath = `/${this.api.apiVersion}`;
        }

        let requestUrl = this.urlTemplate;
        const parameters = this.templateParameters().concat(this.request.queryParameters());

        const wildcardName = "{*}"
        requestUrl = requestUrl.replace("*", wildcardName);

        parameters.forEach(parameter => {
            if (parameter.value()) {
                const parameterPlaceholder = `{${parameter.name()}}`;

                if (requestUrl.indexOf(parameterPlaceholder) > -1) {
                    requestUrl = requestUrl.replace(parameterPlaceholder,
                        !getHidden || !parameter.secret ? Utils.encodeURICustomized(parameter.value())
                            : parameter.value().replace(/./g, "•"));
                }
                else {
                    requestUrl = this.addParam(requestUrl, Utils.encodeURICustomized(parameter.name()),
                        !getHidden || !parameter.secret ? Utils.encodeURICustomized(parameter.value())
                            : parameter.value().replace(/./g, "•"));
                }
            }
        });

        if (this.api.apiVersionSet && this.api.apiVersionSet.versioningScheme === "Query") {
            requestUrl = this.addParam(requestUrl, this.api.apiVersionSet.versionQueryName, this.api.apiVersion);
        }

        requestUrl = requestUrl.replace(wildcardName, "");

        return `${this.api.path}${versionPath}${requestUrl}`;
    }

}