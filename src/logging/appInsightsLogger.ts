import { Bag } from "@paperbits/common";
import { Logger } from "@paperbits/common/logging";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";


export class AppInsightsLogger implements Logger {
    private readonly appInsights: ApplicationInsights;

    constructor(private readonly instrumentationKey: string) {
        if (this.instrumentationKey) {
            this.appInsights = new ApplicationInsights({
                config: {
                    instrumentationKey: instrumentationKey
                }
            });

            this.appInsights.loadAppInsights();
            this.appInsights.trackPageView();
        }
        else {
            console.warn("AppInsights instrumentation key wasn't specified.");
        }

        this.trackSession();
    }

    public async trackSession(properties?: object): Promise<void> {
        this.trackEvent(`Session started`);
    }

    public async trackEvent(eventName: string, properties?: Bag<string>): Promise<void> {
        this.appInsights.trackEvent({ name: eventName, properties });
    }

    public async trackError(error: Error, properties?: Bag<string>): Promise<void> {
        this.appInsights.trackException({ exception: error });
    }

    public async trackView(viewName: string, properties?: Bag<string>): Promise<void> {
        this.appInsights.trackPageView({ name: viewName, properties: properties });
    }

    public async trackMetric(metricName: string, properties?: Bag<string>): Promise<void> {
        // Not supported
    }

    public async trackDependency(name: string, properties?: Bag<string>): Promise<void> {
        // Not implemented
    }
}