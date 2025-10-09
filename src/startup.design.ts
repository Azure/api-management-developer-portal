import "./polyfills";
import * as ko from "knockout";
import { ComponentBinder } from "@paperbits/common/components";
import { XmlHttpRequestClient } from "@paperbits/common/http/xmlHttpRequestClient";
import { InversifyInjector } from "@paperbits/common/injection";
import { ConsoleLogger } from "@paperbits/common/logging/consoleLogger";
import { Logger } from "@paperbits/common/logging/logger";
import { OfflineModule } from "@paperbits/common/persistence/offline.module";
import { CoreDesignModule } from "@paperbits/core/core.design.module";
import { FormsDesignModule } from "@paperbits/forms/forms.design.module";
import { ReactModule } from "@paperbits/react/react.module";
import { StylesDesignModule } from "@paperbits/styles/styles.design.module";
import { LeftPanel } from "./admin/leftPanel";
import { RightPanel } from "./admin/rightPanel";
import { ApimDesignModule } from "./apim.design.module";
import { AuthenticatorResolver } from "./authentication/authenticatorResolver";
import { MapiClient } from "./clients/mapiClient";
import { UnhandledErrorHandler } from "./errors";
import { SessionExpirationErrorHandler } from "./errors/sessionExpirationErrorHandler";


/* Initializing dependency injection container */
const injector = new InversifyInjector();

async function startApp() {
    /* Initializing dependency injection container */
    injector.bindToCollection("autostart", SessionExpirationErrorHandler);
    injector.bindToCollection("autostart", UnhandledErrorHandler);

    injector.bindSingleton("httpClient", XmlHttpRequestClient);
    injector.bindSingleton("logger", ConsoleLogger);
    injector.bindSingleton("authenticatorResolver", AuthenticatorResolver);
    const authenticatorResolver = injector.resolve<AuthenticatorResolver>("authenticatorResolver");
    const authenticator = await authenticatorResolver.getAuthenticator();
    injector.bindInstance("authenticator", authenticator);

    injector.bindModule(new CoreDesignModule());
    injector.bindModule(new StylesDesignModule());
    injector.bindModule(new FormsDesignModule());

    injector.bindSingleton("apiClient", MapiClient);
    injector.bindModule(new ApimDesignModule());
    injector.bindModule(new ReactModule());
    injector.bindModule(new OfflineModule({ autosave: false }));
}

startApp()
    .then(() => {
        injector.resolve("autostart");

        /* Bootstrapping the application */
        if (document.readyState === "complete") {
            applyBindings();
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                applyBindings();
            });
        }
        const logger = injector.resolve<Logger>("logger");
        logger.trackEvent("App", { message: "App starting..." });
    })
    .catch((error) => {
        const logger = injector.resolve<Logger>("logger");
        logger.trackError(error, { message: "App failed to start." });
    });

function applyBindings(): void {
    setImmediate(() => ko.applyBindings(undefined, document.body));

    // Binding the React app to element along with container
    const componentBinder = injector.resolve<ComponentBinder>("reactComponentBinder");
    const leftPanel = document.getElementById("admin-left-panel");
    componentBinder.bind(leftPanel, LeftPanel);
    const rightPanel = document.getElementById("admin-right-panel");
    componentBinder.bind(rightPanel, RightPanel);
}
