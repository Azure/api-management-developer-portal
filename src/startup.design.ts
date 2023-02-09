import "./polyfills";
import * as ko from "knockout";
import { InversifyInjector } from "@paperbits/common/injection";
import { OfflineModule } from "@paperbits/common/persistence/offline.module";
import { CoreDesignModule } from "@paperbits/core/core.design.module";
import { PopupDesignModule } from "@paperbits/core/popup";
import { FormsDesignModule } from "@paperbits/forms/forms.design.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { StylesDesignModule } from "@paperbits/styles/styles.design.module";
import { ApimDesignModule } from "./apim.design.module";
import { SessionExpirationErrorHandler } from "./errors/sessionExpirationErrorHandler";
import { ComponentBinder } from "@paperbits/common/editing";
import { ReactModule } from "@paperbits/react/react.module";
import { SidePanel } from "./admin/sidePanel";


/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindToCollection("autostart", SessionExpirationErrorHandler);
injector.bindModule(new CoreDesignModule());
injector.bindModule(new StylesDesignModule());
injector.bindModule(new ProseMirrorModule());
injector.bindModule(new PopupDesignModule());
injector.bindModule(new FormsDesignModule());
injector.bindModule(new ApimDesignModule());
injector.bindModule(new ReactModule()); // important!
injector.bindModule(new OfflineModule({ autosave: false }));
injector.resolve("autostart");

/* Bootstrapping the application */
document.addEventListener("DOMContentLoaded", () => {
    // Uncomment me to load the content editor
    // setImmediate(() => ko.applyBindings(undefined, document.body));

    // Binding the React app
    const componentBinder = injector.resolve<ComponentBinder>("reactComponentBinder");
    const element = document.getElementById("admin-panel");
    componentBinder.bind(element, SidePanel); // This will bind the application to element along with container.
});