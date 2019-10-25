import template from "./content.html";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../../authentication/IAuthenticator";
import { ProvisionService } from "../../services/provisioningService";

@Component({
    selector: "content-workshop",
    template: template,
    injectable: "contentWorkshop"
})
export class ContentWorkshop {
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
            this.viewManager.closeWorkshop("content-workshop");
        }
        catch (error) {
            this.viewManager.notifyError("Publishing", `Unable to schedule publishing. Please try again later.`);
        }
    }

    public async unpublish(): Promise<void> {
        const view: View = {
            heading: "Reset content",
            component: {
                name: "reset-details-workshop",
            }
        }
        this.viewManager.openViewAsWorkshop(view);
    }
}
