import "./polyfills";
import "./components/runtime/bindingHandlers/scrollintoview";
import "./components/runtime/bindingHandlers/codesample";
import "./components/runtime/bindingHandlers/schemaobjecttype";
import "./components/runtime/bindingHandlers/markdown";
import { InversifyInjector } from "@paperbits/common/injection";
import { ApimRuntimeModule } from "./apim.runtime.module";

document.addEventListener("DOMContentLoaded", () => {
    const injector = new InversifyInjector();
    injector.bindModule(new ApimRuntimeModule());
});

