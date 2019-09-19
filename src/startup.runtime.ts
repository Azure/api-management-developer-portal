import "./polyfills";
import "./components/runtime/bindingHandlers/scrollintoview";
import "./components/runtime/bindingHandlers/codesample";
import "./components/runtime/bindingHandlers/schemaobjecttype";
import "./components/runtime/bindingHandlers/markdown";
import "./components/runtime/bindingHandlers/barChart";
import "./components/runtime/bindingHandlers/mapChart";
import "./components/runtime/bindingHandlers/minMaxAvgChart";
import { InversifyInjector } from "@paperbits/common/injection";
import { ApimRuntimeModule } from "./apim.runtime.module";
import { HistoryRouteHandler, LocationRouteHandler } from "@paperbits/common/routing";

document.addEventListener("DOMContentLoaded", () => {
    const injector = new InversifyInjector();
    injector.bindModule(new ApimRuntimeModule());

    if (location.href.contains("designtime=true")) {
        injector.bindToCollection("autostart", HistoryRouteHandler);
    }
    else {
        injector.bindToCollection("autostart", LocationRouteHandler);
    }

    injector.resolve("autostart");
});