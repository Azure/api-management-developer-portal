import template from "./widget-runtime.html";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../../constants";
import * as ko from "knockout";
import { HttpClient, HttpRequest } from "@paperbits/common/http";


@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class WidgetRuntime {
    public readonly sessionDescription: ko.Observable<string>;

    constructor(private readonly httpClient: HttpClient) {
        this.sessionNumber = ko.observable();
        this.sessionDescription = ko.observable();
    }

    @Param()
    public readonly sessionNumber: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const sessionNumber = this.sessionNumber();

        const request: HttpRequest = {
            url: `https://conferenceapi.azurewebsites.net/session/${sessionNumber}`,
            method: "GET"
        };

        const response = await this.httpClient.send<string>(request);
        const sessionDescription = response.toText();

        this.sessionDescription(sessionDescription);
    }
    
    @OnDestroyed()
    public async dispose(): Promise<void> {
        // Your cleanup widget logic
    }
}