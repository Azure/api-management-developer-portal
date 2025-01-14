import { InversifyInjector } from "@paperbits/common/injection";
import { CoreRuntimeModule } from "@paperbits/core/core.runtime.module";
import { StyleRuntimeModule } from "@paperbits/styles/styles.runtime.module";
import { ApimRuntimeModule } from "./apim.runtime.module";
import { staticDataEnvironment } from "./../environmentConstants";
import { define } from "mime";
import { TraceClick } from "./bindingHandlers/traceClick";
import { Logger } from "@paperbits/common/logging";
import { TelemetryConfigurator } from "./telemetry/telemetryConfigurator";
import { Utils } from "./utils";

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

let telemetryConfigurator = new TelemetryConfigurator(injector);
telemetryConfigurator.configure();

window.onbeforeunload = () => {
    if (!location.pathname.startsWith("/signin-sso") &&
        !location.pathname.startsWith("/signup") &&
        !location.pathname.startsWith("/signin")) {
        const rest = location.href.split(location.pathname)[1];
        const returnUrl = location.pathname + rest;
        sessionStorage.setItem("returnUrl", returnUrl);
        Utils.setCookie("returnUrl", returnUrl); // for delegation
    }
};