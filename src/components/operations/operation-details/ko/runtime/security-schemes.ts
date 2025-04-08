import * as ko from "knockout";
import template from "./security-schemes.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { AuthorizationServer } from "../../../../../models/authorizationServer";
import { ApiKeyDetails } from "./apiKeyDetails";

@Component({
    selector: "security-schemes",
    template: template,
})

export class SecuritySchemes {

    public displayServersName: boolean;

    constructor() {
        this.authorizationServers = ko.observable();
    }

    @Param()
    public apiKeyDetails: ko.Observable<ApiKeyDetails>;

    @Param()
    public authorizationServers: ko.Observable<AuthorizationServer[]>;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.displayServersName = this.authorizationServers().length > 1;
    }
}