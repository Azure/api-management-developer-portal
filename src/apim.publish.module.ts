import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ConsoleLogger } from "@paperbits/common/logging";
import { AzureBlobStorage } from "@paperbits/azure";
import { MapiClient } from "./services/mapiClient";
import { MapiObjectStorage } from "./persistence/mapiObjectStorage";
import { ListOfApisModule } from "./components/apis/list-of-apis/ko/listOfApis.module";
import { DetailsOfApiModule } from "./components/apis/details-of-api/ko/detailsOfApi.module";
import { HistoryOfApiModule } from "./components/apis/history-of-api/ko/historyOfApi.module";
import { SigninModule } from "./components/users/signin/signin.module";
import { SigninSocialModule } from "./components/users/signin-social/signinSocial.module";
import { SignupModule } from "./components/users/signup/signup.module";
import { SignupSocialModule } from "./components/users/signup-social/signupSocial.module";
import { ProfileModule } from "./components/users/profile/profile.module";
import { SubscriptionsModule } from "./components/users/subscriptions/subscriptions.module";
import { ProductDetailsModule } from "./components/products/product-details/productDetails.module";
import { StaticRouter } from "./components/staticRouter";
import { StaticUserService } from "./services/userService";
import { StaticAuthenticator } from "./components/staticAuthenticator";
import { OperationListModule } from "./components/operations/operation-list/ko/operationList.module";
import { OperationDetailsModule } from "./components/operations/operation-details/ko/operationDetails.module";
import { ProductListModule } from "./components/products/product-list/ko/productList.module";
import { ProductSubscribeModule } from "./components/products/product-subscribe/ko/productSubscribe.module";
import { ProductApisModule } from "./components/products/product-apis/ko/productApis.module";
import { ProductSubscriptionsModule } from "./components/products/product-subscriptions/ko/productSubscriptions.module";
import { IdentityService } from "./services/identityService";
import { ResetPasswordModule } from "./components/users/reset-password/resetPassword.module";
import { ConfirmPasswordModule } from "./components/users/confirm-password/ko/confirmPassword.module";
import { ChangePasswordModule } from "./components/users/change-password/ko/changePassword.module";
import { ReportsModule } from "./components/reports/ko/reports.module";
import { TenantService } from "./services/tenantService";
import { ValidationSummaryModule } from "./components/users/validation-summary/validationSummary.module";
import { BackendService } from "./services/backendService";
import { StaticRoleService } from "./services/roleService";
import { ProvisionService } from "./services/provisioningService";

export class ApimPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new ListOfApisModule());
        injector.bindModule(new DetailsOfApiModule());
        injector.bindModule(new HistoryOfApiModule());
        injector.bindModule(new SigninModule());
        injector.bindModule(new SigninSocialModule());
        injector.bindModule(new SignupModule());
        injector.bindModule(new SignupSocialModule());
        injector.bindModule(new ProfileModule());
        injector.bindModule(new SubscriptionsModule());
        injector.bindModule(new ProductListModule());
        injector.bindModule(new ProductDetailsModule());
        injector.bindModule(new ProductApisModule());
        injector.bindModule(new ProductSubscriptionsModule());
        injector.bindModule(new ProductSubscribeModule());
        injector.bindModule(new OperationListModule());
        injector.bindModule(new OperationDetailsModule());
        injector.bindModule(new ResetPasswordModule());
        injector.bindModule(new ConfirmPasswordModule());
        injector.bindModule(new ChangePasswordModule());
        injector.bindModule(new ReportsModule());
        injector.bindModule(new ValidationSummaryModule());
        injector.bindSingleton("blobStorage", AzureBlobStorage);
        injector.bindSingleton("tenantService", TenantService);        
        injector.bindSingleton("backendService", BackendService);
        injector.bindSingleton("userService", StaticUserService);
        injector.bindSingleton("roleService", StaticRoleService);
        injector.bindSingleton("tenantService", TenantService);
        injector.bindSingleton("provisioningService", ProvisionService);
        injector.bindSingleton("identityService", IdentityService);
        injector.bindSingleton("router", StaticRouter);
        injector.bindSingleton("authenticator", StaticAuthenticator);
        injector.bindSingleton("mapiClient", MapiClient);
        injector.bindSingleton("objectStorage", MapiObjectStorage);
        injector.bindSingleton("logger", ConsoleLogger);
    }
}