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



/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindToCollection("autostart", SessionExpirationErrorHandler);
injector.bindModule(new CoreDesignModule());
injector.bindModule(new StylesDesignModule());
injector.bindModule(new ProseMirrorModule());
injector.bindModule(new PopupDesignModule());
injector.bindModule(new FormsDesignModule());
injector.bindModule(new ApimDesignModule());
injector.bindModule(new OfflineModule({ autosave: false }));
injector.resolve("autostart");

/* Bootstrapping the application */
document.addEventListener("DOMContentLoaded", () => {
    setImmediate(() => ko.applyBindings(undefined, document.body));
});