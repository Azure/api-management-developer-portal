import { MapiObjectStorage } from "./persistence/mapiObjectStorage";
import { DefaultAuthenticator } from "./components/defaultAuthenticator";
import { AccessTokenRouteChecker } from "./services/accessTokenRouteChecker";
import { IRouteHandler } from "@paperbits/common/routing";
import { MapiClient } from "./services/mapiClient";
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
import { UserService } from "./services/userService";
import { AzureBlobStorage } from "@paperbits/azure";


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
        injector.bindSingleton("userService", UserService);
        injector.bindSingleton("smapiClient", MapiClient);

        const authenticator = new DefaultAuthenticator();
        injector.bindInstance("authenticator", authenticator);
        injector.bindSingleton("objectStorage", MapiObjectStorage);

        const routeHandler = injector.resolve<IRouteHandler>("routeHandler");
        const checker = new AccessTokenRouteChecker(authenticator);
        routeHandler.addRouteChecker(checker);
    }
}