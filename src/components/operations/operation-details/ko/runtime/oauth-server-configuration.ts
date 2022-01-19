import * as ko from "knockout";
import template from "./oauth-server-configuration.html";
import { Component, Param } from "@paperbits/common/ko/decorators";
import { AuthorizationServer } from "../../../../../models/authorizationServer";

@Component({
    selector: "oauth-server-configuration",
    template: template,
})

export class OauthServerConfiguration {

    public displayedGrantFlows: ko.Observable<string[]>;

    constructor() {
        this.authorizationServer = ko.observable();
        this.displayedGrantFlows = ko.observable();
    }

    @Param()
    public authorizationServer: ko.Observable<AuthorizationServer>;
}