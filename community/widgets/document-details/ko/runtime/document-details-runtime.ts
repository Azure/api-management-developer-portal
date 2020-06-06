
import * as ko from "knockout";
import template from "./document-details-runtime.html";
import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { Component, RuntimeComponent, Param, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../..";
import { RouteHelper } from "../../../../../src/routing/routeHelper";

const documentApiUrl = "<URL of the document stored in the storage account>";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class DocumentDetailsRuntime {
    public readonly sessionDescription: ko.Observable<string>;

    constructor(private readonly httpClient: HttpClient, private readonly routeHelper: RouteHelper) {
        this.fileName = ko.observable();
        this.api = ko.observable();
        this.sessionDescription = ko.observable();
    }

    @Param()
    public readonly fileName: ko.Observable<string>;
    public readonly api: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const fileName = this.routeHelper.getHashParameter("fileName");
        const api = this.routeHelper.getApiName();

        const request: HttpRequest = {
            url: `${documentApiUrl}/${fileName}`,
            method: "GET"
        };

        const response = await this.httpClient.send<string>(request);
        const sessionDescription = response.toText();

        this.sessionDescription(sessionDescription);
        this.api(api);
    }
}