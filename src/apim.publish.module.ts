import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ConsoleLogger } from "@paperbits/common/logging";
import { AzureBlobStorage } from "@paperbits/azure";
import { MapiClient } from "./services/mapiClient";
import { MapiObjectStorage } from "./persistence/mapiObjectStorage";
import { ListOfApisModule } from "./components/apis/list-of-apis/ko/listOfApis.module";
import { DetailsOfApiModule } from "./components/apis/details-of-api/ko/detailsOfApi.module";
import { UserSigninModule } from "./components/users/user-signin/ko/userSignin.module";
import { UserSigninSocialModule } from "./components/users/user-signin-social/ko/userSigninSocial.module";
import { UserSignupModule } from "./components/users/user-signup/ko/userSignup.module";
import { UserDetailsModule } from "./components/users/user-details/ko/userDetails.module";
import { UserSubscriptionsModule } from "./components/users/user-subscriptions/ko/userSubscriptions.module";
import { ProductDetailsModule } from "./components/products/product-details/ko/productDetails.module";
import { StaticRouter } from "./components/staticRouter";
import { UserService } from "./services/userService";
import { StaticAuthenticator } from "./components/staticAuthenticator";
import { OperationListModule } from "./components/operations/operation-list/ko/operationList.module";
import { OperationDetailsModule } from "./components/operations/operation-details/ko/operationDetails.module";
import { ProductListModule } from "./components/products/product-list/ko/productList.module";
import { ProductSubscribeModule } from "./components/products/product-subscribe/ko/productSubscribe.module";
import { ProductApisModule } from "./components/products/product-apis/ko/productApis.module";
import { ProductSubscriptionsModule } from "./components/products/product-subscriptions/ko/productSubscriptions.module";
import { IdentityService } from "./services/identityService";


export class ApimPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new UserSigninModule());
        injector.bindModule(new UserSigninSocialModule());
        injector.bindModule(new UserSignupModule());
        injector.bindModule(new UserDetailsModule());
        injector.bindModule(new UserSubscriptionsModule());
        injector.bindModule(new ProductListModule());
        injector.bindModule(new ProductDetailsModule());
        injector.bindModule(new ProductApisModule());
        injector.bindModule(new ProductSubscriptionsModule());
        injector.bindModule(new ProductSubscribeModule());
        injector.bindModule(new OperationListModule());
        injector.bindModule(new OperationDetailsModule());
        injector.bindSingleton("blobStorage", AzureBlobStorage);
        injector.bindSingleton("userService", UserService);
        injector.bindSingleton("identityService", IdentityService);
        injector.bindSingleton("router", StaticRouter);
        injector.bindSingleton("authenticator", StaticAuthenticator);
        injector.bindSingleton("mapiClient", MapiClient);
        injector.bindSingleton("objectStorage", MapiObjectStorage);
        injector.bindSingleton("logger", ConsoleLogger);
    }
}