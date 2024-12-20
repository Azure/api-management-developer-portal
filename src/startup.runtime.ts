import { InversifyInjector } from "@paperbits/common/injection";
import { CoreRuntimeModule } from "@paperbits/core/core.runtime.module";
import { StyleRuntimeModule } from "@paperbits/styles/styles.runtime.module";
import { ApimRuntimeModule } from "./apim.runtime.module";
import { staticDataEnvironment } from "./../environmentConstants";
import { define } from "mime";
import { TraceClick } from "./bindingHandlers/traceClick";
import { Logger } from "@paperbits/common/logging";

define({ "application/x-zip-compressed": ["zip"] }, true);

const injector = new InversifyInjector();
injector.bindModule(new CoreRuntimeModule());
injector.bindModule(new StyleRuntimeModule());
injector.bindModule(new ApimRuntimeModule());

document.addEventListener("DOMContentLoaded", () => {
    if (process.env.NODE_ENV === staticDataEnvironment && process.env.ACCESS_TOKEN) {
        sessionStorage.setItem("accessToken", process.env.ACCESS_TOKEN);
    }

    injector.resolve("autostart");
    const logger = injector.resolve<Logger>("logger");
    const traceClick = new TraceClick(logger);
    traceClick.setupBinding();
});

window.onload = () => {
    const logger = injector.resolve<Logger>("logger");
    if (logger) {
        const observer = new PerformanceObserver((list) => {
            const [timing] = list.getEntriesByType("navigation");
            if (timing) {
                const location = window.location;
                logger.trackEvent("PageLoadCounters", { host: location.host, pathName: location.pathname, total: timing["loadEventEnd"], pageLoadTiming: JSON.stringify(timing)});
            }
        });
        observer.observe({ type: "navigation", buffered: true });
    } else {
        console.error("Logger is not available");
    }
}

window.onbeforeunload = () => {
    if (!location.pathname.startsWith("/signin-sso") &&
        !location.pathname.startsWith("/signup") &&
        !location.pathname.startsWith("/signin")) {
        const rest = location.href.split(location.pathname)[1];
        const returnUrl = location.pathname + rest;
        sessionStorage.setItem("returnUrl", returnUrl);
        document.cookie = `returnUrl=${returnUrl}`; // for delegation
    }
};