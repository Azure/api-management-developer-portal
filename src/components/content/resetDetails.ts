import * as ko from "knockout";
import template from "./resetDetails.html";
import { Component } from "@paperbits/common/ko/decorators";
import { ViewManager } from "@paperbits/common/ui";
import { ProvisionService } from "../../services/provisioningService";
import { Logger } from "@paperbits/common/logging";


@Component({
    selector: "reset-details-workshop",
    template: template
})

export class ResetDetailsWorkshop {
    public readonly response: ko.Observable<string>;
    public readonly canReset: ko.Computed<boolean>;

    constructor (
        private readonly viewManager: ViewManager,
        private readonly provisioningService: ProvisionService,
        private readonly logger: Logger
    ) {
        this.response = ko.observable("");
        this.canReset = ko.pureComputed(() => this.response().toLocaleLowerCase() === "yes");
    }

    public async reset(): Promise<void> {
        try {
            this.logger.traceEvent("Click: Reset portal");

            this.viewManager.notifySuccess("Portal reset", `The portal is being reset...`);
            this.viewManager.clearJourney();

            await this.provisioningService.cleanup();
            await this.provisioningService.provision();

            this.logger.traceEvent("Success: Portal reset");

            window.location.reload();
        } 
        catch (error) {
            this.viewManager.notifyError("Confirm", `Unable to reset portal. Please try again later.`);
        }
    }
}