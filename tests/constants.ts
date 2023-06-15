import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions } from "puppeteer";

export const BrowserLaunchOptions: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions = {
    headless: true,
    ignoreHTTPSErrors: true,
    product: "chrome",
    devtools: true,
    userDataDir: "/puppeteer-data-dir", // necessary for persistent user preferences
    args: [ '--incognito' ]
};