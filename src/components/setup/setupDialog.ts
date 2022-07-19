import template from "./setupDialog.html";
import * as Constants from "../../constants";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { ViewManager } from "@paperbits/common/ui";
import { Router } from "@paperbits/common/routing";
import { ProvisionService } from "../../services/provisioningService";

@Component({
    selector: "setup-dialog",
    template: template
})
export class SetupDialog {

    constructor(
        private readonly viewManager: ViewManager,
        private readonly router: Router,
        private readonly provisioningService: ProvisionService
    ) { }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.viewManager.removeShutter();
        await this.provisioningService.provision();
        await this.router.navigateTo(Constants.pageUrlHome);

        window.location.reload();
    }
}