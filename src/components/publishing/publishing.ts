import template from "./publishing.html";
import { IViewManager } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../../authentication/IAuthenticator";

@Component({
    selector: "publishing-workshop",
    template: template,
    injectable: "publishingWorkshop"
})
export class PublishingWorkshop {
    constructor(
        private readonly viewManager: IViewManager,
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
    ) {
        this.viewManager = viewManager;
    }

    public async publish(): Promise<void> {
        try {
            const accessToken = this.authenticator.getAccessToken();
            this.httpClient.send({ url: "/publish", method: "POST", headers: [{ name: "Authorization", value: accessToken }] });
            this.viewManager.notifySuccess("Publishing", `The website is being published...`);
            this.viewManager.closeWorkshop("publishing-workshop");
        }
        catch (error) {
            this.viewManager.notifyError("Publishing", `Unable to schedule publishing. Please try again later.`);
        }
    }
}
