import { InversifyInjector } from "@paperbits/common/injection";
import { ApimRuntimeModule } from "./apim.runtime.module";
import { HistoryRouteHandler, LocationRouteHandler } from "@paperbits/common/routing";


const injector = new InversifyInjector();
injector.bindModule(new ApimRuntimeModule());

if (location.href.includes("designtime=true")) {
    injector.bindToCollection("autostart", HistoryRouteHandler);
}
else {
    injector.bindToCollection("autostart", LocationRouteHandler);
}

document.addEventListener("DOMContentLoaded", () => {
    injector.resolve("autostart");
});

window.onbeforeunload = () => {
    if (!location.pathname.startsWith("/signin-sso") && 
        !location.pathname.startsWith("/signup")) {
        const rest = location.href.split(location.pathname)[1];
        const returnUrl = location.pathname + rest;
        sessionStorage.setItem("returnUrl", returnUrl);
    } 
};