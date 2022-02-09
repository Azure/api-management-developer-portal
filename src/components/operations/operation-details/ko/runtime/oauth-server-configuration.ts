import * as ko from "knockout";
import template from "./oauth-server-configuration.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AuthorizationServer } from "../../../../../models/authorizationServer";

@Component({
    selector: "oauth-server-configuration",
    template: template,
})

export class OauthServerConfiguration {

    public displayedGrantFlows: ko.Observable<string>;
    public displayedScopes: ko.Observable<string>;

    constructor() {
        this.authorizationServer = ko.observable();
        this.displayedGrantFlows = ko.observable();
        this.displayedScopes = ko.observable();
    }

    @Param()
    public authorizationServer: ko.Observable<AuthorizationServer>;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.displayedGrantFlows(this.authorizationServer().grantTypes.join(', ').toString());
        this.displayedScopes(this.authorizationServer().scopes.join(', ').toString());
    }
}