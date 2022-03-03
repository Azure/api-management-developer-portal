import * as ko from "knockout";
import { Component, Param } from "@paperbits/common/ko/decorators";
import template from "./terms-of-use.html";

@Component({
    selector: "terms-of-use",
    template: template
})
export class TermsOfUse {
    public readonly showTerms: ko.Observable<boolean>;
    public readonly showHideLabel: ko.Observable<string>;

    @Param()
    public readonly isConsentRequired: ko.Observable<boolean>;
    
    @Param()
    public readonly termsOfUse: ko.Observable<boolean>;

    @Param()
    public readonly consented: ko.Observable<boolean>;

    constructor() {
        this.showTerms = ko.observable();
        this.showHideLabel = ko.observable("Show");
        this.isConsentRequired = ko.observable();
        this.termsOfUse = ko.observable();
        this.consented = ko.observable();
    }

    public toggleTermsOfUse(): void {
        if (this.showTerms()) {
            this.showHideLabel("Show");
        }
        else {
            this.showHideLabel("Hide");
        }

        this.showTerms(!this.showTerms());
    }
}
