import * as ko from "knockout";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { DefaultEventManager } from "@paperbits/common/events";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { SettingsProvider } from "@paperbits/common/configuration";
import { DefaultRouteHandler, IRouteHandler } from "@paperbits/common/routing";
import { ApiList } from "./components/runtime/api-list/api-list";
import { Documentation } from "./components/runtime/documentation/documentation";
import { ApiService } from "./services/apiService";
import { TagService } from "./services/tagService";
import { TenantService } from "./services/tenantService";
import { ApiDetails } from "./components/runtime/api-details/api-details";
import { OperationDetails } from "./components/runtime/operation-details/operation-details";
import { OperationConsole } from "./components/runtime/operation-console/operation-console";
import { SchemaDetails } from "./components/runtime/schema-details/schema-details";
import { ProductService } from "./services/productService";
import { FileInput } from "./components/runtime/file-input/file-input";
import { MapiClient } from "./services/mapiClient";
import { UsersService } from "./services/usersService";
import { UserLogin } from "./components/runtime/user-login/user-login";
import { UserSignup } from "./components/runtime/user-signup/user-signup";
import { UserDetails } from "./components/runtime/user-details/user-details";
import { UserSubscriptions } from "./components/runtime/user-subscriptions/user-subscriptions";
import { ProductList } from "./components/runtime/product-list/product-list";
import { ProductDetails } from "./components/runtime/product-details/product-details";
import { ProductSubscribe } from "./components/runtime/product-subscribe/product-subscribe";
import { AccessTokenRouteChecker } from "./services/accessTokenRouteChecker";
import { DefaultAuthenticator } from "./components/defaultAuthenticator";
import { Spinner } from "./components/runtime/spinner/spinner";

export class ApimRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("eventManager", DefaultEventManager);
        injector.bindSingleton("routeHandler", DefaultRouteHandler);
        injector.bindModule(new KnockoutRegistrationLoaders());

        injector.bind("apiDocumentation", Documentation);
        injector.bind("apiList", ApiList);
        injector.bind("apiDetails", ApiDetails);
        injector.bind("operationDetails", OperationDetails);
        injector.bind("operationConsole", OperationConsole);
        injector.bind("schemaDetails", SchemaDetails);
        injector.bind("fileInput", FileInput);
        injector.bind("apiService", ApiService);
        injector.bind("tagService", TagService);
        injector.bind("tenantService", TenantService);
        injector.bind("productService", ProductService);
        injector.bind("userLogin", UserLogin);
        injector.bind("userSignup", UserSignup);
        injector.bind("userDetails", UserDetails);
        injector.bind("userSubscriptions", UserSubscriptions);
        injector.bind("productList", ProductList);
        injector.bind("productDetails", ProductDetails);
        injector.bind("productSubscribe", ProductSubscribe);
        injector.bind("usersService", UsersService);
        injector.bind("spinner", Spinner);
        injector.bindSingleton("smapiClient", MapiClient);
        injector.bindSingleton("httpClient", XmlHttpRequestClient);
        injector.bindSingleton("settingsProvider", SettingsProvider);

        const authenticator = new DefaultAuthenticator();
        injector.bindInstance("authenticator", authenticator);

        const routeHandler = injector.resolve<IRouteHandler>("routeHandler");
        const checker = new AccessTokenRouteChecker(authenticator);
        routeHandler.addRouteChecker(checker); // TODO: inject.bindToCollection(...)
    }
}


export class KnockoutRegistrationLoaders {
    public register(injector): void {
        const injectableComponentLoader = {
            loadViewModel(name, config, callback) {
                if (config.injectable) {
                    const viewModelConstructor = (params) => {
                        const resolvedInjectable: any = injector.resolve(config.injectable);

                        let instance = resolvedInjectable;

                        if (resolvedInjectable.factory) {
                            instance = resolvedInjectable.factory(injector, params);
                        }

                        const parameterDescriptions = Reflect.getMetadata("params", instance.constructor);

                        if (parameterDescriptions) {
                            parameterDescriptions.forEach(parameterName => {
                                const instanceValue = instance[parameterName];
                                const paramerterValue = params[parameterName];

                                if (ko.isObservable(instanceValue)) {
                                    if (ko.isObservable(paramerterValue)) {
                                        // Assigning initial value
                                        instanceValue(paramerterValue());

                                        // Subscribing for all future changes
                                        paramerterValue.subscribe((value) => {
                                            instanceValue(value);
                                        });
                                    }
                                    else {
                                        instanceValue(paramerterValue);
                                    }
                                }
                                else {
                                    instance[parameterName] = ko.unwrap(paramerterValue);
                                }
                            });
                        }

                        const eventDescriptions = Reflect.getMetadata("events", instance.constructor);

                        if (eventDescriptions) {
                            eventDescriptions.forEach(methodReference => {
                                instance[methodReference] = params[methodReference];
                            });
                        }

                        const onMountedMethodDescriptions = Reflect.getMetadata("onmounted", instance.constructor);

                        if (onMountedMethodDescriptions) {
                            onMountedMethodDescriptions.forEach(methodDescription => {
                                const methodReference = instance[methodDescription];

                                if (methodReference) {
                                    methodReference();
                                }
                            });
                        }

                        return instance;
                    };

                    (<any>ko.components.defaultLoader).loadViewModel(name, viewModelConstructor, callback);
                }
                else {
                    // Unrecognized config format. Let another loader handle it.
                    callback(null);
                }
            },

            loadTemplate(name: string, templateHtml: any, callback: (result: Node[]) => void) {
                const parseHtmlFragment = <any>ko.utils.parseHtmlFragment;
                const nodes = parseHtmlFragment(templateHtml, document);

                (<any>ko.components.defaultLoader).loadTemplate(name, nodes, callback);
            },

            loadComponent(componentName: string, config: any, callback: (definition: KnockoutComponentTypes.Definition) => void) {
                const callbackWrapper: (result: KnockoutComponentTypes.Definition) => void = (resultWrapper: KnockoutComponentTypes.Definition) => {

                    const createViewModelWrapper: (params: any, options: { element: Node; }) => any = (params: any, options: { element: Node; }) => {
                        if (config.preprocess) {
                            config.preprocess(options.element, params);
                        }

                        const viewModel = resultWrapper.createViewModel(params, options);

                        if (config.postprocess) {
                            config.postprocess(options.element, viewModel);
                        }

                        return viewModel;
                    };

                    const definitionWrapper /*: KnockoutComponentTypes.Definition*/ = {
                        template: resultWrapper.template,
                        createViewModel: createViewModelWrapper,
                        constructor: config.constructor
                    };

                    callback(definitionWrapper);
                };

                (<any>ko.components.defaultLoader).loadComponent(componentName, config, callbackWrapper);
            },
        };

        ko.components.loaders.unshift(injectableComponentLoader);
    }
}