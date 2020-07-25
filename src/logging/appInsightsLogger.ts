import { Bag } from "@paperbits/common";
import { Logger } from "@paperbits/common/logging";
import { AppInsights } from "applicationinsights-js";


export class LogService implements Logger {
    constructor(private readonly instrumentationKey: string) {
        if (this.instrumentationKey && location.hostname.endsWith(".net")) {
            AppInsights.downloadAndSetup({ instrumentationKey: this.instrumentationKey });
        }
        else {
            console.warn("AppInsights instrumentation key wasn't specified or cannot be used in current environment.");
        }

        this.trackSession();
    }

    public async trackSession(properties?: object): Promise<void> {
        this.trackEvent(`Session started`);
    }

    public async trackEvent(eventName: string, properties?: Bag<string>): Promise<void> {
        AppInsights.trackEvent(eventName, properties);
    }

    public async trackError(error: Error, properties?: Bag<string>): Promise<void> {
        AppInsights.trackException(error);
    }

    public async trackView(viewName: string, properties?: Bag<string>): Promise<void> {
        AppInsights.trackPageView(name);
    }

    public async trackMetric(metricName: string, properties?: Bag<string>): Promise<void> {
        // Not implemented
    }

    public async trackDependency(name: string, properties?: Bag<string>): Promise<void> {
        // Not implemented
    }
}