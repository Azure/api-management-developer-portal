import { OfflineObjectStorage } from "@paperbits/common/persistence";
import * as ko from "knockout";
import template from "./resetDetails.html";
import { Component } from "@paperbits/common/ko/decorators";
import { ViewManager } from "@paperbits/common/ui";
import { ProvisionService } from "../../services/provisioningService";
import { Logger } from "@paperbits/common/logging";
import { isApplyNewThemeEnabledSetting } from "../../constants";

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
        private readonly offlineObjectStorage: OfflineObjectStorage,
        private readonly logger: Logger
    ) {
        this.response = ko.observable("");
        this.canReset = ko.pureComputed(() => this.response().toLocaleLowerCase() === "yes");
    }

    public async reset(applyNewTheme: boolean = true): Promise<void> {
        try {
            this.logger.trackEvent("ResetWebsite", { message: "Click: Reset website" });

            localStorage.clear();
            this.offlineObjectStorage.discardChanges();
            this.viewManager.clearJourney();
            this.viewManager.hideToolboxes();
            this.viewManager.notifySuccess("Website reset", `The website is being reset...`);
            this.viewManager.setShutter();

            await this.provisioningService.cleanup();
            localStorage.setItem(isApplyNewThemeEnabledSetting, applyNewTheme ? "true" : "false");

            this.logger.trackEvent("ResetWebsite", { message: "Success: Website reset" });

            window.location.reload();
        }
        catch (error) {
            this.viewManager.notifyError("Confirm", `Unable to reset website. Please try again later.`);
            this.logger.trackError(error, { message: "Unable to reset website" });
        }
    }
}