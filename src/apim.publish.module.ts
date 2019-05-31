import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { MapiClient } from "./services/mapiClient";
import { MapiObjectStorage } from "./persistence/mapiObjectStorage";
import { ListOfApisModule } from "./components/list-of-apis/ko/listOfApis.module";
import { DetailsOfApiModule } from "./components/details-of-api/ko/detailsOfApi.module";
import { UserLoginModule } from "./components/users/user-login/ko/userLogin.module";
import { UserSignupModule } from "./components/users/user-signup/ko/userSignup.module";
import { UserDetailsModule } from "./components/users/user-details/ko/userDetails.module";
import { UserSubscriptionsModule } from "./components/users/user-subscriptions/ko/userSubscriptions.module";
import { ProductListModule } from "./components/products/product-list/ko/productList.module";
import { ProductDetailsModule } from "./components/products/product-details/ko/productDetails.module";
import { ProductSubscribeModule } from "./components/products/product-subscribe/ko/productSubscribe.module";
import { StaticRouteHandler } from "./components/staticRouteHandler";
import { UserService } from "./services/userService";
import { StaticAuthenticator } from "./components/staticAuthenticator";
import { AzureBlobStorage } from "@paperbits/azure";
import { OperationListModule } from "./components/operation-list/ko/operationList.module";
import { OperationDetailsModule } from "./components/operation-details/ko/operationDetails.module";

export class ApimPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new UserLoginModule());
        injector.bindModule(new UserSignupModule());
        injector.bindModule(new UserDetailsModule());
        injector.bindModule(new UserSubscriptionsModule());
        injector.bindModule(new ProductListModule());
        injector.bindModule(new ProductDetailsModule());
        injector.bindModule(new ProductSubscribeModule());
        injector.bindModule(new OperationListModule());
        injector.bindModule(new OperationDetailsModule());
        injector.bindSingleton("blobStorage", AzureBlobStorage);
        injector.bindSingleton("userService", UserService);
        injector.bindSingleton("routeHandler", StaticRouteHandler);
        injector.bindSingleton("authenticator", StaticAuthenticator);
        injector.bindSingleton("smapiClient", MapiClient);
        injector.bindSingleton("objectStorage", MapiObjectStorage);
    }
}