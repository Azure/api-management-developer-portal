import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { DefaultEventManager } from "@paperbits/common/events";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { SettingsProvider } from "@paperbits/common/configuration";
import { DefaultRouteHandler, IRouteHandler } from "@paperbits/common/routing";
import { KnockoutRegistrationLoaders } from "@paperbits/core/ko/knockout.loaders";
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
        injector.bindModule(new KnockoutRegistrationLoaders());
        injector.bindSingleton("eventManager", DefaultEventManager);
        injector.bindSingleton("routeHandler", DefaultRouteHandler);
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