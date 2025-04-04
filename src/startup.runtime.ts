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
import { ISettingsProvider } from "@paperbits/common/configuration/ISettingsProvider";
import { FEATURE_CLIENT_TELEMETRY, isRedesignEnabledSetting } from "./constants";

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

initFeatures();

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

function initFeatures() {
    const logger = injector.resolve<Logger>("logger");
    const settingsProvider = injector.resolve<ISettingsProvider>("settingsProvider");
    Utils.getFeatureValueOrNull(FEATURE_CLIENT_TELEMETRY, settingsProvider, logger)
        .then((isEnabled) => {
            const featureFlagValue = isEnabled === null || isEnabled;
            logger.trackEvent("FeatureFlag", {
                feature: FEATURE_CLIENT_TELEMETRY,
                enabled: featureFlagValue.toString(),
                message: `Feature flag '${FEATURE_CLIENT_TELEMETRY}' - ${isEnabled ? 'enabled' : 'disabled'}`
            });
            let telemetryConfigurator = new TelemetryConfigurator(injector);
            if (featureFlagValue) {
                telemetryConfigurator.configure();
            } else {
                telemetryConfigurator.cleanUp();
            }
        });
    checkIsRedesignEnabled(settingsProvider, logger)
        .then((isEnabled) => {
            logger.trackEvent("FeatureFlag", {
                feature: isRedesignEnabledSetting,
                enabled: isEnabled.toString(),
                message: `Feature flag '${isRedesignEnabledSetting}' - ${isEnabled ? 'enabled' : 'disabled'}`
            });
        });
}

async function checkIsRedesignEnabled(settingsProvider: ISettingsProvider, logger: Logger): Promise<boolean> {
    try {
        const setting = await settingsProvider.getSetting(isRedesignEnabledSetting);

        if (!setting) return false;

        return Boolean(setting);
    } catch (error) {
        logger?.trackEvent("FeatureFlag", { message: "Feature flag check failed", data: error.message });
        return false;
    }
}