import "./polyfills";
import * as ko from "knockout";
import { InversifyInjector } from "@paperbits/common/injection";
import { CoreDesignModule } from "@paperbits/core/core.design.module";
import { StylesDesignModule } from "@paperbits/styles/styles.design.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { OfflineModule } from "@paperbits/common/persistence/offline.module";
import { ApimDesignModule } from "./apim.design.module";


/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindModule(new CoreDesignModule());
injector.bindModule(new StylesDesignModule());
injector.bindModule(new ProseMirrorModule());
injector.bindModule(new ApimDesignModule());
injector.bindModule(new OfflineModule({ autosave: false }));
injector.resolve("autostart");

/* Bootstrapping the application */
document.addEventListener("DOMContentLoaded", () => {
    setImmediate(() => ko.applyBindings(undefined, document.body));
});