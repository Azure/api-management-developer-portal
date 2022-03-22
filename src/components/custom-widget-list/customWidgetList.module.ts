import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ContentWorkshop } from "./customWidgetList";
import { OperationsSectionToolButton } from "./operationsSection";
import { CreateWidget } from "./createWidget";
import { customWidgetUriKey } from "../custom-widget/ko/utils";
import { CustomWidgetHandlers } from "../custom-widget";

export class CustomWidgetListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("contentWorkshop", ContentWorkshop);
        injector.bind("resetDetailsWorkshop", CreateWidget);
        injector.bindToCollection("workshopSections", OperationsSectionToolButton);

        /**
         * Here we can load custom custom-widget-binder configurations from a blob storage. For example, it could be some kind of registry: `/custom-code/registry.json`.
         */
        const configurations = {
            "test-uri": {
                name: "test-uri",
                displayName: "Test URI",
                category: "Custom widgets",
                // iconUrl: "https://...",
                uri: "test-uri",
                customInputValue: JSON.stringify({
                    data: {
                        field2: "Lorem ipsum dolor sit amet!"
                    }
                }),
            }
        };

        const promises = [];

        const sources = new URLSearchParams(window.location.search).get("MS_APIM_CW_devsrcs");
        if (sources) {
            const sourcesObj = JSON.parse(sources);

            Object.keys(sourcesObj).forEach(key => {
                try {
                    const url = new URL(sourcesObj[key]);
                    window.sessionStorage.setItem(customWidgetUriKey(key), url.href);
                    promises.push(fetch(url.href + "msapim.config.json"));
                } catch (e) {
                    console.warn(key, sourcesObj[key], e);
                }
            });
        }

        Promise.all(promises)
            .then(r => r.map(e => e.json()))
            .then(r => Promise.all(r).then(r => {
                r.forEach(config => {
                    configurations[config.uri] = {
                        ...config,
                        customInputValue: JSON.stringify(config.customInputValue),
                    };
                });

                Object.values(configurations).forEach(config => {
                    console.log(config);
                    injector.bindInstanceToCollection("widgetHandlers", new CustomWidgetHandlers(config));
                });
            }));
    }
}
