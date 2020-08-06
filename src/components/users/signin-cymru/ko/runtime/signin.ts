import * as ko from "knockout";
import * as validation from "knockout.validation";
import template from "./signin.html";
import { EventManager } from "@paperbits/common/events";
import { Component, RuntimeComponent, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { UsersService } from "../../../../../services/usersService";
import { MapiError } from "../../../../../errors/mapiError";
import { ValidationReport } from "../../../../../contracts/validationReport";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing/router";

@RuntimeComponent({
    selector: "signin-cymru-runtime"
})
@Component({
    selector: "signin-cymru-runtime",
    template: template
})
export class Signin {
    public readonly username: ko.Observable<string>;
    public readonly password: ko.Observable<string>;
    public readonly errorMessages: ko.ObservableArray<string>;
    public readonly hasErrors: ko.Computed<boolean>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly eventManager: EventManager,
        private readonly routeHelper: RouteHelper,
        private readonly router: Router
    ) {

        this.delegationUrl = ko.observable();
        this.username = ko.observable("");
        this.password = ko.observable("");
        this.errorMessages = ko.observableArray([]);
        this.hasErrors = ko.pureComputed(() => this.errorMessages().length > 0);
        this.working = ko.observable(false);

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.username.extend(<any>{ required: { message: `Angen e-bost.` }, email: true });
        this.password.extend(<any>{ required: { message: `Angen cyfrinair.` } });
    }

    @Param()
    public delegationUrl: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        try {
            const userId = await this.usersService.getCurrentUserId();

            if (userId) {
                this.navigateToHome();
            }
            else {
                const redirectUrl = this.delegationUrl();

                if (redirectUrl) {
                    window.open(redirectUrl, "_self");
                }
            }
        }
        catch (error) {
            if (error.code === "Unauthorized" || error.code === "ResourceNotFound") {
                return;
            }

            throw error;
        }
    }

    public navigateToHome(): void {
        this.usersService.navigateToHome();
    }

    public async signin(): Promise<void> {
        this.errorMessages([]);

        const result = validation.group({
            username: this.username,
            password: this.password
        });

        const clientErrors = result();

        if (clientErrors.length > 0) {
            result.showAllMessages();
            const validationReport: ValidationReport = {
                source: "signin",
                errors: clientErrors
            };
            this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            this.errorMessages(clientErrors);
            return;
        }

        try {
            this.working(true);
            
            const userId = await this.usersService.signIn(this.username(), this.password());

            if (userId) {
                const clientReturnUrl = sessionStorage.getItem("returnUrl");
                const returnUrl = this.routeHelper.getQueryParameter("returnUrl") || clientReturnUrl;
                if (returnUrl) {
                    this.router.navigateTo(returnUrl);
                    return;
                }
                
                this.navigateToHome();

                const validationReport: ValidationReport = {
                    source: "signin",
                    errors: []
                };

                this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            }
            else {
                this.errorMessages(["Bwydwch e-bost a chyfrinair dilys."]);

                const validationReport: ValidationReport = {
                    source: "signin",
                    errors: ["Bwydwch e-bost a chyfrinair dilys."]
                };
                
                this.eventManager.dispatchEvent("onValidationErrors", validationReport);
            }
        }
        catch (error) {
            if (error instanceof MapiError) {
                if (error.code === "identity_not_confirmed") {
                    const msg = [`Daethom o hyd i gyfrif heb ei gadarnhau ar gyfer y cyfeiriad e-bost ${this.username()}. Er mwyn cwblhau'r broses o greu eich cyfrif, mae angen i ni wirio'ch cyfeiriad e-bost. Rydym wedi anfon e-bost at ${this.username()}. Dilynwch y cyfarwyddiadau y tu mewn i'r e-bost i gynnau'ch cyfrif. Os na fydd yr e-bost yn eich cyrraedd o fewn yr ychydig funudau nesaf, edrychwch yn eich ffolder post sothach.`];
                    const validationReport: ValidationReport = {
                        source: "signin",
                        errors: msg
                    };
                    this.eventManager.dispatchEvent("onValidationErrors", validationReport);
                    return;
                }

                this.errorMessages([error.message]);

                const validationReport: ValidationReport = {
                    source: "signin",
                    errors: [error.message]
                };
                this.eventManager.dispatchEvent("onValidationErrors", validationReport);

                return;
            }

            throw new Error(`Methodd mewngofnodi. Gwall: ${error.message}`);
        }
        finally {
            this.working(false);
        }
    }
}