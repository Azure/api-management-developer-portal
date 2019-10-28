import * as ko from "knockout";
import template from "./resetDetails.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { ProvisionService } from "../../services/provisioningService";

@Component({
    selector: "reset-details-workshop",
    template: template,
    injectable: "resetDetailsWorkshop"
})

export class ResetDetailsWorkshop {
    public readonly response: ko.Observable<string>;
    public readonly isYes: ko.Computed<boolean>;
    constructor (
        private provisioningService: ProvisionService,
    ) {
        this.response = ko.observable("");
        this.isYes = ko.computed(() => this.response() == "yes");
    }

    public async reset(): Promise<void> {
        await this.provisioningService.cleanup();
        await this.provisioningService.provision();
    }
}