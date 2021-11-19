import { InversifyInjector } from "@paperbits/common/injection";
import { CoreRuntimeModule } from "@paperbits/core/core.runtime.module";
import { StyleRuntimeModule } from "@paperbits/styles/styles.runtime.module";
import { ApimRuntimeModule } from "./apim.runtime.module";
import * as Constants from "./constants";


const injector = new InversifyInjector();
injector.bindModule(new CoreRuntimeModule());
injector.bindModule(new StyleRuntimeModule());
injector.bindModule(new ApimRuntimeModule());

document.addEventListener("DOMContentLoaded", () => {
    injector.resolve("autostart");
});

window.onbeforeunload = () => {
    if (!location.pathname.startsWith("/signin-sso") &&
        !location.pathname.startsWith("/signup")) {
        const rest = location.href.split(location.pathname)[1];
        const returnUrl = location.pathname + rest;
        sessionStorage.setItem("returnUrl", returnUrl);
        document.cookie = `returnUrl=${returnUrl}`; // for delegation
    }
};