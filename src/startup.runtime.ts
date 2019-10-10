import "./polyfills";
import "./bindingHandlers/scrollintoview";
import "./bindingHandlers/codesample";
import "./bindingHandlers/schemaobjecttype";
import "./bindingHandlers/markdown";
import "./bindingHandlers/barChart";
import "./bindingHandlers/mapChart";
import "./bindingHandlers/minMaxAvgChart";
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