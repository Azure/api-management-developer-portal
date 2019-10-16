import * as ko from "knockout";
import * as moment from "moment";
import template from "./user-details.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { User } from "../../../../../models/user";
import { UsersService } from "../../../../../services/usersService";

@RuntimeComponent({ selector: "user-details" })
@Component({
    selector: "user-details",
    template: template,
    injectable: "userDetails"
})
export class UserDetails {
    public firstName: ko.Observable<string>;
    public lastName: ko.Observable<string>;
    public email: ko.Observable<string>;
    public registrationDate: ko.Computed<string>;
    public isEdit: ko.Observable<boolean>;
    public working: ko.Observable<boolean>;
    public password: ko.Observable<string>;
    public confirmPassword: ko.Observable<string>;
    public user: ko.Observable<User>;

    constructor(private readonly usersService: UsersService) {
        this.user = ko.observable();
        this.firstName = ko.observable();
        this.lastName = ko.observable();
        this.email = ko.observable();
        this.password = ko.observable();
        this.confirmPassword = ko.observable();
        this.isEdit = ko.observable(false);
        this.working = ko.observable(false);
        this.registrationDate = ko.computed(() => this.getRegistrationDate());
    }

    @OnMounted()
    public async loadUser(): Promise<void> {
        await this.usersService.ensureSignedIn();

        const model: User = await this.usersService.getCurrentUser();

        this.setUser(model);
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

    public toggleEdit(): void {
        if (this.isEdit()) {
            this.firstName(this.user().firstName);
            this.lastName(this.user().lastName);
        }
        this.isEdit(!this.isEdit());
    }

    public async changeAccountInfo(): Promise<void> {
        if (this.isEdit()) {
            this.working(true);
            const updateData = {
                firstName: this.firstName(),
                lastName: this.lastName()
            };

            const user = await this.usersService.updateUser(this.user().id, updateData);
            this.working(false);
            this.setUser(user);
            this.toggleEdit();
        }
    }

    public async closeAccount(): Promise<void> {
        const confirmed = window.confirm(`Dear ${this.user().firstName} ${this.user().lastName},
You are about to close your account associated with email address
${this.user().email}.
You will not be able to sign in to or restore your closed account. Are you sure you want to close your account?`);

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
}