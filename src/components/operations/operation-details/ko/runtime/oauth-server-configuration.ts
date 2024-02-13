import * as ko from "knockout";
import template from "./oauth-server-configuration.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AuthorizationServer } from "../../../../../models/authorizationServer";

@Component({
    selector: "oauth-server-configuration",
    template: template,
})
export class OauthServerConfiguration {

    public displayServersName: boolean;

    constructor() {
        this.authorizationServers = ko.observable();
    }

    @Param()
    public authorizationServers: ko.Observable<AuthorizationServer[]>;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.displayServersName = this.authorizationServers().length > 1;
    }
}