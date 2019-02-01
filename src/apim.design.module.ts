import { DefaultAuthenticator } from "./components/defaultAuthenticator";
import { AccessTokenRouteChecker } from "./services/accessTokenRouteChecker";
import { IRouteHandler } from "@paperbits/common/routing";
import { SmapiClient } from "./services/smapiClient";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { DocumentationModule } from "./components/documentation/ko/documentation.module";
import { DocumentationEditorModule } from "./components/documentation/ko/documentationEditor.module";
import { ListOfApisModule } from "./components/list-of-apis/ko/listOfApis.module";
import { ListOfApisEditorModule } from "./components/list-of-apis/ko/listOfApisEditor.module";
import { DetailsOfApiModule } from "./components/details-of-api/ko/detailsOfApi.module";
import { DetailsOfApiEditorModule } from "./components/details-of-api/ko/detailsOfApiEditor.module";
import { UserLoginModule } from "./components/user-login/ko/userLogin.module";
import { UserLoginEditorModule } from "./components/user-login/ko/userLoginEditor.module";
import { UserSignupModule } from "./components/user-signup/ko/userSignup.module";
import { UserSignupEditorModule } from "./components/user-signup/ko/userSignupEditor.module";
import { UserDetailsModule } from "./components/user-details/ko/userDetails.module";
import { UserDetailsEditorModule } from "./components/user-details/ko/userDetailsEditor.module";
import { UserSubscriptionsModule } from "./components/user-subscriptions/ko/userSubscriptions.module";
import { UserSubscriptionsEditorModule } from "./components/user-subscriptions/ko/userSubscriptionsEditor.module";
import { ProductListModule } from "./components/product-list/ko/productList.module";
import { ProductListEditorModule } from "./components/product-list/ko/productListEditor.module";
import { ProductDetailsModule } from "./components/product-details/ko/productDetails.module";
import { ProductDetailsEditorModule } from "./components/product-details/ko/productDetailsEditor.module";
import { ProductSubscribeModule } from "./components/product-subscribe/ko/productSubscribe.module";
import { ProductSubscribeEditorModule } from "./components/product-subscribe/ko/productSubscribeEditor.module";
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
import { AzureBlobStorage } from "./components/azureBlobStorage2";


export class ApimDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new DocumentationModule());
        injector.bindModule(new DocumentationEditorModule());
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new ListOfApisEditorModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new DetailsOfApiEditorModule());
        injector.bindModule(new UserLoginModule());
        injector.bindModule(new UserLoginEditorModule());
        injector.bindModule(new UserSignupModule());
        injector.bindModule(new UserSignupEditorModule());
        injector.bindModule(new UserDetailsModule());
        injector.bindModule(new UserDetailsEditorModule());
        injector.bindModule(new UserSubscriptionsModule());
        injector.bindModule(new UserSubscriptionsEditorModule());
        injector.bindModule(new ProductListModule());
        injector.bindModule(new ProductListEditorModule());
        injector.bindModule(new ProductDetailsModule());
        injector.bindModule(new ProductDetailsEditorModule());
        injector.bindModule(new ProductSubscribeModule());
        injector.bindModule(new ProductSubscribeEditorModule());
        injector.bindSingleton("blobStorage", AzureBlobStorage);
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
        injector.bindSingleton("smapiClient", SmapiClient);

        const authenticator = new DefaultAuthenticator();
        injector.bindInstance("authenticator", authenticator);

        injector.bindInstance("objectStorage", null); // TODO: Remove after moving to version 0.1.41

        const routeHandler = injector.resolve<IRouteHandler>("routeHandler");
        const checker = new AccessTokenRouteChecker(authenticator);
        routeHandler.addRouteChecker(checker);
    }
}