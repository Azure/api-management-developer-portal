import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions } from "puppeteer";

export const BrowserLaunchOptions: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions = {
    headless: false,
    ignoreHTTPSErrors: true,
    product: "chrome",
    devtools: true,
    userDataDir: "/puppeteer-data-dir", // necessary for persistant user preferences
};