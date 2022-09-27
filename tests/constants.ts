import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions } from "puppeteer";

export const BrowserLaunchOptions: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions = {
    headless: false,
    ignoreHTTPSErrors: true,
    product: "chrome"
};