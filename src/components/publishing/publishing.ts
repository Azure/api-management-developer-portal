import template from "./publishing.html";
import { ViewManager } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../../authentication/IAuthenticator";
import { ProvisionService } from "../../services/provisioningService";

@Component({
    selector: "publishing-workshop",
    template: template,
    injectable: "publishingWorkshop"
})
export class PublishingWorkshop {
    constructor(
        private readonly viewManager: ViewManager,
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
        private provisioningService: ProvisionService
    ) {
        this.viewManager = viewManager;
    }

    public async publish(): Promise<void> {
        try {
            const accessToken = this.authenticator.getAccessToken();
            await this.httpClient.send({ url: "/publish", method: "POST", headers: [{ name: "Authorization", value: accessToken }] });
            this.viewManager.notifySuccess("Publishing", `The website is being published...`);
            this.viewManager.closeWorkshop("publishing-workshop");
        }
        catch (error) {
            this.viewManager.notifyError("Publishing", `Unable to schedule publishing. Please try again later.`);
        }
    }

    public async unpublish(): Promise<void> {
        try {
            this.viewManager.notifySuccess("Website reset", `The website is being resetted...`);
            await this.provisioningService.cleanup();
            await this.provisioningService.provision();
            this.viewManager.closeWorkshop("publishing-workshop");
            const toast = this.viewManager.addToast("Website reset", `Website has been reset successfully...`, [
                {
                    title: "Ok",
                    iconClass: "paperbits-check-2",
                    action: async (): Promise<void> => {
                        this.viewManager.removeToast(toast);
                    }
                },
            ]);
        } 
        catch (error) {
            this.viewManager.notifyError("Reset", `Unable to reset website. Please try again later.`);
        }
    }
}
