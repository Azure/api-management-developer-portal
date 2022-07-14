import { Bag } from "@paperbits/common";
import { Logger } from "@paperbits/common/logging";
import { HttpClient, HttpRequest, HttpHeader } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { DevPortalEvent } from "../models/logging/devPortalEvent";
import { v4 as uuidv4 } from 'uuid';
import * as Constants from "./../constants";

export class DevPortalLogger implements Logger {
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
        //Not implemented
    }

    public async trackEvent(eventName: string, properties?: Bag<string>): Promise<void> {
        let devPortalEvent = new DevPortalEvent();
        
        devPortalEvent.eventType = eventName;
        devPortalEvent.message = properties?.message;
        devPortalEvent.eventData = JSON.stringify(properties);
        
        this.traceEvent(devPortalEvent);
    }

    public async trackError(error: Error, properties?: Bag<string>): Promise<void> {
        let devPortalEvent = new DevPortalEvent();
        
        devPortalEvent.eventType = "Error";
        devPortalEvent.message = properties?.message;
        devPortalEvent.eventData = JSON.stringify(error);
        
        this.traceEvent(devPortalEvent);
    }

    public async trackView(viewName: string, properties?: Bag<string>): Promise<void> {
        let devPortalEvent = new DevPortalEvent();
        
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

    private async traceEvent(devPortalEvent: DevPortalEvent){
        const datetime = new Date();

        devPortalEvent.timestamp = datetime.toISOString();
        devPortalEvent.activityId = uuidv4();

        let developerPortalType = await this.settingsProvider.getSetting<string>(Constants.SettingNames.developerPortalType) || "self-hosted-portal";
        
        let headers: HttpHeader[] = [];
        headers.push({ name: "client-version", value: this.clientVersion });
        headers.push({ name: "developer-portal-type", value: developerPortalType });

        const request: HttpRequest = {
            url: await this.getBackendUrl() + `/trace`,
            method: "POST",
            headers: headers,
            body: JSON.stringify(devPortalEvent.toJson())
        };
        this.httpClient.send(request);
    }

    private async getBackendUrl(): Promise<string>{
        if (this.backendUrlSet === false){
            this.backendUrl = await this.settingsProvider.getSetting<string>(Constants.SettingNames.backendUrl) || "";
            this.backendUrlSet = true;
        }
        
        return this.backendUrl;
    }
}