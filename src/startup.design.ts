import "./polyfills";
import * as ko from "knockout";
import { InversifyInjector } from "@paperbits/common/injection";
import { CoreEditModule } from "@paperbits/core/core.edit.module";
import { FormsEditModule } from "@paperbits/forms/forms.edit.module";
import { StylingEditModule } from "@paperbits/styles/styles.edit.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { OfflineModule } from "@paperbits/common/persistence/offline.module";
import { ApimDesignModule } from "./apim.design.module";


/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindModule(new CoreEditModule());
injector.bindModule(new FormsEditModule());
injector.bindModule(new StylingEditModule());
injector.bindModule(new ProseMirrorModule());
injector.bindModule(new ApimDesignModule());
injector.bindModule(new OfflineModule({ autosave: true }));
injector.resolve("autostart");

/* Bootstrapping the application */
document.addEventListener("DOMContentLoaded", () => {
    setImmediate(() => ko.applyBindings(undefined, document.body));
});