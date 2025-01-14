import { Bag } from "@paperbits/common";
import { Logger } from "@paperbits/common/logging";
import { HttpClient, HttpRequest, HttpHeader } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ClientEvent } from "../models/logging/clientEvent";
import { v4 as uuidv4 } from "uuid";
import * as Constants from "../constants";
import { Utils } from "../utils";

export enum eventTypes {
    error = "Error",
    userError = "UserError",
    trace = "Trace",
    aadB2CLogin = "AadB2CLogin",
    aadLogin = "AadLogin",
    click = "Click",
}

export class ClientLogger implements Logger {
    private clientVersion: string;
    private backendUrl: string;
    private backendUrlSet: boolean = false;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.clientVersion = process.env.VERSION;
    }

    public async trackSession(properties?: object): Promise<void> {
        // Not implemented
    }

    public async trackEvent(eventName: string, properties?: Bag<string>): Promise<void> {
        const devPortalEvent = new ClientEvent();
        this.addUserDataToEventData(properties);

        devPortalEvent.eventType = eventName;
        devPortalEvent.message = properties?.message;
        devPortalEvent.eventData = JSON.stringify(properties);

        this.traceEvent(devPortalEvent);
    }

    public async trackError(error: Error, properties?: Bag<string>): Promise<void> {
        const devPortalEvent = new ClientEvent();
        this.addUserDataToEventData(properties);

        devPortalEvent.eventType = eventTypes.error;
        devPortalEvent.message = error?.message;
        devPortalEvent.eventData = JSON.stringify(properties);
        devPortalEvent.exception = error?.stack;

        this.traceEvent(devPortalEvent);
    }

    public async trackView(viewName: string, properties?: Bag<string>): Promise<void> {
        const devPortalEvent = new ClientEvent();
        this.addUserDataToEventData(properties);

        devPortalEvent.eventType = viewName;
        devPortalEvent.message = properties?.message;
        devPortalEvent.eventData = JSON.stringify(properties);

        this.traceEvent(devPortalEvent);
    }

    public async trackMetric(metricName: string, properties?: Bag<string>): Promise<void> {
        // Not implemented
    }

    public async trackDependency(name: string, properties?: Bag<string>): Promise<void> {
        // Not implemented
    }

    private addUserDataToEventData(eventData?: Bag<string>) {
        const userData = Utils.getUserData();
        eventData = eventData || {};
        eventData[Constants.USER_ID] = userData.userId;
        eventData[Constants.USER_SESSION] = userData.sessionId;
    }

    private async traceEvent(clientEvent: ClientEvent) {
        const datetime = new Date();

        clientEvent.timestamp = datetime.toISOString();
        clientEvent.activityId = uuidv4();

        const developerPortalType = await this.settingsProvider.getSetting<string>(Constants.SettingNames.developerPortalType) || Constants.DeveloperPortalType.selfHosted;

        const headers: HttpHeader[] = [];
        headers.push({ name: "client-version", value: this.clientVersion });
        headers.push({ name: "developer-portal-type", value: developerPortalType });

        const request: HttpRequest = {
            url: await this.getBackendUrl() + `/trace`,
            method: "POST",
            headers: headers,
            body: JSON.stringify(clientEvent.toJson())
        };

        this.httpClient.send(request);
    }

    private async getBackendUrl(): Promise<string> {
        if (this.backendUrlSet === false) {
            this.backendUrl = await this.settingsProvider.getSetting<string>(Constants.SettingNames.backendUrl) || "";
            this.backendUrlSet = true;
        }

        return this.backendUrl;
    }
}