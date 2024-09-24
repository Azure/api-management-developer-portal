import * as ko from "knockout";
import * as moment from "moment";
import * as validation from "knockout.validation";
import template from "./profile.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Router } from "@paperbits/common/routing/router";
import { User } from "../../../../../models/user";
import { UsersService } from "../../../../../services";
import { DelegationParameters, DelegationAction } from "../../../../../contracts/tenantSettings";
import { TenantService } from "../../../../../services/tenantService";
import { pageUrlChangePassword } from "../../../../../constants";
import { Utils } from "../../../../../utils";
import { EventManager } from "@paperbits/common/events/eventManager";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { BackendService } from "../../../../../services/backendService";
import { ValidationMessages } from "../../../validationMessages";
import { Logger } from "@paperbits/common/logging";

@RuntimeComponent({
    selector: "profile-runtime"
})
@Component({
    selector: "profile-runtime",
    template: template
})
export class Profile {
    public firstName: ko.Observable<string>;
    public lastName: ko.Observable<string>;
    public email: ko.Observable<string>;
    public registrationDate: ko.Computed<string>;
    public isEdit: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;
    public password: ko.Observable<string>;
    public confirmPassword: ko.Observable<string>;
    public user: ko.Observable<User>;
    public isBasicAccount: ko.Observable<boolean>;

    constructor(
        private readonly usersService: UsersService,
        private readonly tenantService: TenantService,
        private readonly backendService: BackendService,
        private readonly eventManager: EventManager,
        private readonly router: Router,
        private readonly logger: Logger) {
        this.user = ko.observable();
        this.firstName = ko.observable();
        this.lastName = ko.observable();
        this.email = ko.observable();
        this.password = ko.observable();
        this.confirmPassword = ko.observable();
        this.isEdit = ko.observable(false);
        this.isBasicAccount = ko.observable(false);
        this.working = ko.observable(false);
        this.registrationDate = ko.computed(() => this.getRegistrationDate());

        validation.init({
            insertMessages: false,
            errorElementClass: "is-invalid",
            decorateInputElement: true
        });

        this.firstName.extend(<any>{ required: { message: ValidationMessages.firstNameRequired } });
        this.lastName.extend(<any>{ required: { message: ValidationMessages.lastNameRequired } });
    }

    @OnMounted()
    public async loadUser(): Promise<void> {
        await this.usersService.ensureSignedIn();

        const model: User = await this.usersService.getCurrentUser();
        this.isBasicAccount(model?.isBasicAccount);
        this.setUser(model);
    }

    private async applyDelegation(action: DelegationAction): Promise<boolean> {
        if (!this.user()) {
            return false;
        }
        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.UserId] = Utils.getResourceName("users", this.user().id);
            const delegationUrl = await this.backendService.getDelegationString(action, delegationParam);
            if (delegationUrl) {
                location.assign(delegationUrl);
            }

            return true;
        }
        return false;
    }

    private setUser(model: User): any {
        if (!model) {
            return;
        }

        this.user(model);
        this.firstName = ko.observable(model.firstName);
        this.lastName = ko.observable(model.lastName);
        this.email = ko.observable(model.email);
    }

    public async toggleEdit(): Promise<void> {
        const isDelegationApplied = await this.applyDelegation(DelegationAction.changeProfile);
        if (isDelegationApplied) {
            return;
        }
        if (this.isEdit()) {
            this.firstName(this.user().firstName);
            this.lastName(this.user().lastName);
        }

        this.isEdit(!this.isEdit());
    }

    public async toggleEditPassword(): Promise<void> {
        const isDelegationApplied = await this.applyDelegation(DelegationAction.changePassword);
        if (isDelegationApplied) {
            return;
        }
        await this.router.navigateTo(pageUrlChangePassword);
    }

    public async changeAccountInfo(): Promise<void> {
        if (!this.isEdit()) {
            return;
        }

        this.working(true);
        dispatchErrors(this.eventManager, ErrorSources.changeProfile, []);
        try {
            const user = await this.usersService.updateUser(this.user().id, this.firstName(), this.lastName());
            this.setUser(user);
            await this.toggleEdit();
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.changeProfile, error, this.logger);
        }
        this.working(false);
    }

    public async closeAccount(): Promise<void> {
        const isDelegationApplied = await this.applyDelegation(DelegationAction.closeAccount);
        if (isDelegationApplied) {
            return;
        }
        const confirmed = window.confirm(
            this.isBasicAccount() ? this.getCloseBasicAccountWarning(this.user().firstName, this.user().lastName, this.user().email)
                : this.getCloseDelegationAccountWarning(this.user().firstName, this.user().lastName, this.user().email));
        if (confirmed) {
            await this.usersService.deleteUser(this.user().id);
        }
    }

    public timeToString(date: Date): string {
        return date ? moment(date).format("MM/DD/YYYY") : "";
    }

    public getRegistrationDate(): string {
        return (this.user() && this.timeToString(this.user().registrationDate)) || "";
    }

    public isUserChanged(): boolean {
        return this.firstName() !== this.user().firstName || this.lastName() !== this.user().lastName;
    }

    public isEmailChanged(): boolean {
        return this.email() !== this.user().email;
    }

    public isPasswordChanged(): boolean {
        return this.password() && (this.password() === this.confirmPassword());
    }

    private getCloseBasicAccountWarning(firstName: string, lastName: string, email: string): string {
        return `Dear ${firstName} ${lastName}, \nYou are about to close your account associated with email address ${email}.\nYou will not be able to sign in to or restore your closed account. Are you sure you want to close your account?`;
    }

    private getCloseDelegationAccountWarning(firstName: string, lastName: string, email: string): string {
        return `Dear ${firstName} ${lastName}, \nYou are about to close your account associated with email address ${email}.\nAre you sure you want to close your account?`;
    }

}