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

        this.traceSession();
    }

    public async traceSession(): Promise<void> {
        this.traceEvent(`Session started`);
    }

    public async traceEvent(eventName: string, properties?: Bag<string>, measurments?: Bag<number>): Promise<void> {
        AppInsights.trackEvent(eventName, properties, measurments);
    }

    public async traceError(error: Error, handledAt?: string): Promise<void> {
        AppInsights.trackException(error, handledAt);
    }

    public async traceView(name: string): Promise<void> {
        AppInsights.trackPageView(name);
    }
}