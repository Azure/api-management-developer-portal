import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidgetInstanceHandlers } from "./customWidgetInstanceHandlers";
import { CustomWidgetInstanceEditorViewModel, CustomWidgetInstanceViewModel, CustomWidgetInstanceViewModelBinder } from "./ko";
import { CustomWidgetInstanceModelBinder } from ".";
import { customWidgetUriKey } from "./ko/utils";

export class CustomWidgetInstanceDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetScaffold", CustomWidgetInstanceViewModel);
        injector.bind("customWidgetScaffoldEditor", CustomWidgetInstanceEditorViewModel);
        injector.bindToCollection("modelBinders", CustomWidgetInstanceModelBinder);
        injector.bindToCollection("viewModelBinders", CustomWidgetInstanceViewModelBinder);

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
            }
        };

        const promises = [];

        /* load overrides */
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
                    configurations[config.uri] = config;
                });

                Object.values(configurations).forEach(config => {
                    console.log(config);
                    injector.bindInstanceToCollection("widgetHandlers", new CustomWidgetInstanceHandlers(config));
                });
            }));
    }
}