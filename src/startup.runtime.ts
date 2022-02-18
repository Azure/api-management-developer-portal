import { InversifyInjector } from "@paperbits/common/injection";
import { CoreRuntimeModule } from "@paperbits/core/core.runtime.module";
import { StyleRuntimeModule } from "@paperbits/styles/styles.runtime.module";
import { ApimRuntimeModule } from "./apim.runtime.module";
import {staticDataEnvironment} from "./../environmentConstants"

const injector = new InversifyInjector();
injector.bindModule(new CoreRuntimeModule());
injector.bindModule(new StyleRuntimeModule());
injector.bindModule(new ApimRuntimeModule());

document.addEventListener("DOMContentLoaded", () => {
    if (process.env.NODE_ENV === staticDataEnvironment) {
        // Fake token for testing the authenticated version, it's not valid but it respects the regex and contains an expiry date
        sessionStorage.setItem("accessToken", "6189460d4634612164e10999&292202041536&FWpHkq3S32Bxrgs+Mq0i8XTe6eOkv7zbABcdKAg1mofztdVAY7E8DUdFWC/7991FMuH5I5W1RfuJ0GzUjVsEqQ==");
    }

    injector.resolve("autostart");
});

window.onbeforeunload = () => {
    if (!location.pathname.startsWith("/signin-sso") &&
        !location.pathname.startsWith("/signup") &&
        !location.pathname.startsWith("/signin")) {
        const rest = location.href.split(location.pathname)[1];
        const returnUrl = location.pathname + rest;
        sessionStorage.setItem("returnUrl", returnUrl);
        document.cookie = `returnUrl=${returnUrl}`; // for delegation
    }
};