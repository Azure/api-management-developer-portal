import "./polyfills";
import * as ko from "knockout";
import { InversifyInjector } from "@paperbits/common/injection";
import { OfflineModule } from "@paperbits/common/persistence/offline.module";
import { CoreDesignModule } from "@paperbits/core/core.design.module";
import { FormsDesignModule } from "@paperbits/forms/forms.design.module";
import { StylesDesignModule } from "@paperbits/styles/styles.design.module";
import { ApimDesignModule } from "./apim.design.module";
import { SessionExpirationErrorHandler } from "./errors/sessionExpirationErrorHandler";
import { ComponentBinder } from "@paperbits/common/components";
import { ReactModule } from "@paperbits/react/react.module";
import { LeftPanel } from "./admin/leftPanel";
import { RightPanel } from "./admin/rightPanel";


/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindToCollection("autostart", SessionExpirationErrorHandler);
injector.bindModule(new CoreDesignModule());
injector.bindModule(new StylesDesignModule());
injector.bindModule(new FormsDesignModule());
injector.bindModule(new ApimDesignModule());
injector.bindModule(new ReactModule());
injector.bindModule(new OfflineModule({ autosave: false }));
injector.resolve("autostart");

/* Bootstrapping the application */
document.addEventListener("DOMContentLoaded", () => {
    setImmediate(() => ko.applyBindings(undefined, document.body));

    // Binding the React app to element along with container
    const componentBinder = injector.resolve<ComponentBinder>("reactComponentBinder");
    const leftPanel = document.getElementById("admin-left-panel");
    componentBinder.bind(leftPanel, LeftPanel);
    const rightPanel = document.getElementById("admin-right-panel");
    componentBinder.bind(rightPanel, RightPanel);
});