import { AppInsights } from "applicationinsights-js";
import { TenantService } from "../services/tenantService";
import { Bag } from "@paperbits/common";
import { Logger } from "@paperbits/common/logging";


export class LogService implements Logger {
    constructor(
        private readonly instrumentationKey: string,
        private readonly tenantService: TenantService
    ) {
        if (this.instrumentationKey && location.hostname.endsWith(".net")) {
            AppInsights.downloadAndSetup({ instrumentationKey: this.instrumentationKey });
        }
        else {
            console.warn("AppInsights instrumentation key wasn't specified or cannot be used in current environment.");
        }

        this.traceSession();
    }

    public async traceSession(): Promise<void> {
        // const service = await this.tenantService.getServiceName();
        // AppInsights.setAuthenticatedUserContext(null, `${service.name} (${service.sku.name})`);

        this.traceEvent(`Session started`);
    }

    public async traceEvent(eventName: string, properties?: Bag<string>, measurments?: Bag<number>): Promise<void> {
        AppInsights.trackEvent(eventName, properties, measurments);

        if (!this.instrumentationKey && location.hostname === "localhost") {
            console.log(`${eventName}`);
        }
    }

    public async traceError(error: Error, handledAt?: string): Promise<void> {
        AppInsights.trackException(error, handledAt);

        if (!this.instrumentationKey && location.hostname === "localhost") {
            console.log(error);
        }
    }

    public async traceView(name: string): Promise<void> {
        AppInsights.trackPageView(name);

        if (!this.instrumentationKey && location.hostname === "localhost") {
            console.log(`View: ${name}`);
        }
    }
}