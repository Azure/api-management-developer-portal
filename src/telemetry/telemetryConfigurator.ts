import { IInjector } from "@paperbits/common/injection";
import { Logger } from "@paperbits/common/logging";
import { Utils } from "../utils";
import { USER_ACTION, USER_ID, USER_SESSION } from "../constants";

const TrackingEventElements = ["BUTTON", "A"];

export class TelemetryConfigurator {

    constructor(private injector: IInjector) {
        // required for user session init.
        const userId = this.userId
        const sessionId = this.sessionId;
    }

    public get userId(): string {
        const uniqueUser = localStorage.getItem(USER_ID);
        if (uniqueUser) {
            return uniqueUser;
        } else {
            const newId = Utils.guid();
            localStorage.setItem(USER_ID, newId);
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
            navigator.serviceWorker.addEventListener("message", (event) => {
                // console.log("Received message from Service Worker:", event.data);
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
                        const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
                        const jsCssResources = resources.filter(resource => {
                            return resource.initiatorType === "script" || resource.initiatorType === "link";
                        });
                        const stats = {
                            pageLoadTime,
                            domRenderingTime,
                            jsCssResources: jsCssResources.map(resource => ({
                                name: resource.name,
                                duration: resource.duration
                            }))
                        };
                        logger.trackEvent("PageLoad", { host: location.host, pathName: location.pathname, total: timing.loadEventEnd.toString(), pageLoadStats: JSON.stringify(stats), ...screenSize });
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
                console.error("Error processing click user interaction:", error);
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.processUserInteraction(event).then(() => {
                    console.log("Enter key processed");
                }).catch((error) => {
                    console.error("Error processing keydown user interaction:", error);
                });
            }
        });
    }

    public cleanUp() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration) {
                    registration.unregister().then((boolean) => {
                        if (boolean) {
                            console.log("Service Worker unregistered successfully.");
                        } else {
                            console.log("Service Worker unregistering failed.");
                        }
                    }).catch((error) => {
                        console.error("Error unregistering Service Worker:", error);
                    });
                } else {
                    console.log("No Service Worker to unregister.");
                }
            }).catch((error) => {
                console.error("Error getting Service Worker registration:", error);
            });
        } else {
            console.log("Service Worker not registered.");
        }
    }

    private async processUserInteraction(event: Event) {
        const element = event.target as HTMLElement;
        const elementTag = element?.tagName;
        const parent = element?.parentElement;
        const parentTag = parent?.tagName;
        const targetElement = elementTag && TrackingEventElements.includes(elementTag) ? element : (parentTag && TrackingEventElements.includes(parentTag) ? parent : null);
        if (!targetElement) {
            return;
        }

        let eventAction = targetElement.attributes.getNamedItem(USER_ACTION)?.value;
        const eventMessage = {
            elementId: element.id
        };

        const navigation = (targetElement.tagName === "A" && targetElement) as HTMLAnchorElement;

        if (navigation?.href) {
            eventMessage["navigationTo"] = navigation.href;
            eventMessage["navigationText"] = navigation.innerText;
        } else {
            if (targetElement.tagName === "BUTTON") {
                eventAction = `BUTTON clicked with text '${targetElement.innerText?.trim()}'`;
            }
        }

        if (!eventAction && !navigation) {
            return;
        }

        if (eventAction) {
            eventMessage["message"] = eventAction;
        }

        const logger = this.injector.resolve<Logger>("logger");
        await logger.trackEvent("UserEvent", eventMessage);
    }
}