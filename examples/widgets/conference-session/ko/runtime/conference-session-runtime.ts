
import * as ko from "knockout";
import template from "./conference-session-runtime.html";
import { HttpClient, HttpRequest } from "@paperbits/common/http";
import { Component, RuntimeComponent, Param, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../..";

const conferenceApiUrl = "https://conferenceapi.azurewebsites.net/session";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class ConferenceSessionRuntime {
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
            url: `${conferenceApiUrl}/${sessionNumber}`,
            method: "GET"
        };

        const response = await this.httpClient.send<string>(request);
        const sessionDescription = response.toText();

        this.sessionDescription(sessionDescription);
    }
}