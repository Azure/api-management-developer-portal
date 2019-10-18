import * as ko from "knockout";
import template from "./validation-error.html";
import { Component, OnMounted, RuntimeComponent} from "@paperbits/common/ko/decorators";

@RuntimeComponent({ selector: "validation-error" })
@Component({
    selector: "validation-error",
    template: template,
    injectable: "validation-error"
})

export class ValidationError {
    public readonly errorMsgs: ko.ObservableArray<string>;
    public hasErrors: ko.Observable<Boolean>;
    private errorSignIn: string[];
    private errorSignUp: string[];
    private errorSocialAcc: string[];

    constructor() {
        this.errorMsgs = ko.observableArray([]);
        this.hasErrors = ko.observable(false);
        this.errorSignIn = new Array();
        this.errorSignUp = new Array();
        this.errorSocialAcc = new Array();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        document.addEventListener("validationerror", this.showValidationError.bind(this), false);
    }

    private showValidationError(event: CustomEvent): void {
        if (event.detail.from == "signin") {
            this.errorSignIn = event.detail.msgs;
        } else if (event.detail.from == "signup") {
            this.errorSignUp = event.detail.msgs;
        } else if (event.detail.from == "socialAcc"){
            this.errorSocialAcc = event.detail.msgs;
        }
        this.errorMsgs([].concat(this.errorSignIn).concat(this.errorSignUp).concat(this.errorSocialAcc));
        if (this.errorMsgs().length > 0) {
            this.hasErrors(true);
        } else { 
            this.hasErrors(false);
        }
    }
}

