import template from "./setupDialog.html";
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
        try {
            this.viewManager.removeShutter();
            await this.provisioningService.provision();
            await this.router.navigateTo("/");
            
            window.location.reload();
        }
        catch (error) {
            throw error;
        }
    }
}