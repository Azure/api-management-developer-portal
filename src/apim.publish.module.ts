import { createDocument } from "@paperbits/core/ko/knockout-rendring";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { SmapiClient } from "./services/smapiClient";
import { DocumentationModule } from "./components/documentation/ko/documentation.module";
import { ListOfApisModule } from "./components/list-of-apis/ko/listOfApis.module";
import { DetailsOfApiModule } from "./components/details-of-api/ko/detailsOfApi.module";
import { UserLoginModule } from "./components/user-login/ko/userLogin.module";
import { UserSignupModule } from "./components/user-signup/ko/userSignup.module";
import { UserDetailsModule } from "./components/user-details/ko/userDetails.module";
import { UserSubscriptionsModule } from "./components/user-subscriptions/ko/userSubscriptions.module";
import { ProductListModule } from "./components/product-list/ko/productList.module";
import { ProductDetailsModule } from "./components/product-details/ko/productDetails.module";
import { ProductSubscribeModule } from "./components/product-subscribe/ko/productSubscribe.module";
import { StaticRouteHandler } from "./components/staticRouteHandler";
import { PageService } from "./services/pageService";
import { BlogService } from "./services/blogService";
import { LayoutService } from "./services/layoutService";
import { BlockService } from "./services/blockService";
import { MediaService } from "./services/mediaService";
import { UrlService } from "./services/urlService";
import { NavigationService } from "./services/navigationService";
import { StyleService } from "./services/styleService";
import { SiteService } from "./services/siteService";
import { ContentItemService } from "./services/contentItemService";
import { UserService } from "./services/userService";
import { StaticAuthenticator } from "./components/staticAuthenticator";

export class ApimPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        createDocument();

        injector.bindModule(new DocumentationModule());
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new UserLoginModule());
        injector.bindModule(new UserSignupModule());
        injector.bindModule(new UserDetailsModule());
        injector.bindModule(new UserSubscriptionsModule());
        injector.bindModule(new ProductListModule());
        injector.bindModule(new ProductDetailsModule());
        injector.bindModule(new ProductSubscribeModule());
        injector.bindSingleton("pageService", PageService);
        injector.bindSingleton("blogService", BlogService);
        injector.bindSingleton("layoutService", LayoutService);
        injector.bindSingleton("blockService", BlockService);
        injector.bindSingleton("mediaService", MediaService);
        injector.bindSingleton("urlService", UrlService);
        injector.bindSingleton("navigationService", NavigationService);
        injector.bindSingleton("styleService", StyleService);
        injector.bindSingleton("siteService", SiteService);
        injector.bindSingleton("contentItemService", ContentItemService);
        injector.bindSingleton("userService", UserService);
        injector.bindSingleton("routeHandler", StaticRouteHandler);
        injector.bindSingleton("authenticator", StaticAuthenticator);
        injector.bindSingleton("smapiClient", SmapiClient);
    }
}