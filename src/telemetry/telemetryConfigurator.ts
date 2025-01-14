import { IInjector } from "@paperbits/common/injection";
import { Logger } from "@paperbits/common/logging";
import { Utils } from "../utils";
import { USER_ACTION, USER_ID, USER_SESSION } from "../constants";

const TrackingEventElements = ["BUTTON", "A"];

export class TelemetryConfigurator {

    constructor(private injector: IInjector) {
        // required for user session init.
        console.log("TelemetryConfigurator initialized with userId: " + this.userId + " and sessionId: " + this.sessionId);
    }

    public get userId(): string {
        const sessionCookie = Utils.getCookie(USER_ID);
        if(sessionCookie) {
            return sessionCookie.value;
        } else {
            const newId = Utils.guid();
            Utils.setCookie(USER_ID, newId, 400); // set cookie for 400 days - maximum allowed by the browser
            return newId;
        }
    }

    public get sessionId(): string {
        const sessionId = sessionStorage.getItem(USER_SESSION);
        if (sessionId) {
            return sessionId;
        } else {
            const newId = Utils.guid();
            sessionStorage.setItem(USER_SESSION, newId);
            return newId;
        }
    }

    public configure(): void {
        const logger = this.injector.resolve<Logger>("logger");
        // Register service worker for network telemetry.
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/serviceWorker.js", { scope: "/" }).then(registration => {
                console.log("Service Worker registered with scope:", registration.scope);
            }).catch(error => {
                console.error("Service Worker registration failed:", error);
                logger.trackError(error);
            });

            // Listen for messages from the service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('Received message from Service Worker:', event.data);
                if (event.data) {
                    logger.trackEvent("NetworkRequest", event.data);
                } else {
                    console.error("No telemetry data received from Service Worker.");
                }
            });
        }

        // Init page load telemetry.
        window.onload = () => {
            if (logger) {
                const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
                    const timing = list.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
                    if (timing) {
                        const location = window.location;
                        const screenSize = {
                            width: window.innerWidth.toString(),
                            height: window.innerHeight.toString()
                        };
                        const pageLoadTime = timing.loadEventEnd - timing.loadEventStart;
                        const domRenderingTime = timing.domComplete - timing.domInteractive;
                        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
                        const jsCssResources = resources.filter(resource => {
                            return resource.initiatorType === 'script' || resource.initiatorType === 'link';
                        });
                        const stats = {
                            pageLoadTime,
                            domRenderingTime,
                            jsCssResources: jsCssResources.map(resource => ({
                                name: resource.name,
                                duration: resource.duration
                            }))
                        };
                        logger.trackEvent("PageLoad", { host: location.host,  pathName: location.pathname, total: timing.loadEventEnd.toString(), pageLoadStats: JSON.stringify(stats), ...screenSize });
                    }
                });
                observer.observe({ type: "navigation", buffered: true });
            } else {
                console.error("Logger is not available");
            }
        }

        document.addEventListener("click", (event) => {
            this.processUserInteraction(event).then(() => {
                console.log("Click processed");
            }).catch((error) => {
                console.error("Error processing user interaction:", error);
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.processUserInteraction(event).then(() => {
                        console.log("Enter key processed");
                    }).catch((error) => {
                        console.error("Error processing user interaction:", error);
                    });
            }
        });
    }

    private async processUserInteraction(event: Event) {
        const element = event.target as HTMLElement;
        const elementTag = element?.tagName;
        const parent = element?.parentElement;
        const parentTag = parent?.tagName;
        if (!(elementTag && TrackingEventElements.includes(elementTag)) && !(parentTag && TrackingEventElements.includes(parentTag))) {
            return;
        }

        const eventAction = element.attributes.getNamedItem(USER_ACTION)?.value;
        const eventMessage = {
            elementId: element.id
        };

        let navigation = ((elementTag === "A" && element) || (parentTag === "A" && parent)) as HTMLAnchorElement;

        if (navigation && navigation.href) {
            eventMessage["navigationTo"] = navigation.href;
            eventMessage["navigationText"] = navigation.innerText;
        }

        if (!eventAction && !navigation) {
            return;
        }

        if (eventAction) {
            eventMessage["eventAction"] = eventAction;
        }

        const logger = this.injector.resolve<Logger>("logger");
        await logger.trackEvent("UserEvent", eventMessage);
    }
}