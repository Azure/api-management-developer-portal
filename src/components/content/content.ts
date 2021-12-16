import template from "./content.html";
import * as moment from "moment";
import * as Constants from "../../constants";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { Logger } from "@paperbits/common/logging";
import { IAuthenticator } from "../../authentication/IAuthenticator";
import { AppError } from "./../../errors/appError";
import { MapiError } from "../../errors/mapiError";
import { MapiClient } from "../../services";


@Component({
    selector: "content-workshop",
    template: template
})
export class ContentWorkshop {
    constructor(
        private readonly viewManager: ViewManager,
        private readonly mapiClient: MapiClient,
        private readonly authenticator: IAuthenticator,
        private readonly logger: Logger
    ) { }

    public async publish(): Promise<void> {
        this.logger.trackEvent("Click: Publish website");

        if (!await this.authenticator.isAuthenticated()) {
            throw new AppError("Cannot publish website", new MapiError("Unauthorized", "You're not authorized."));
        }

        try {
            const revisionName = moment.utc().format(Constants.releaseNameFormat);

            await this.mapiClient.put(`/portalRevisions/${revisionName}`, null, {
                properties: { description: "", isCurrent: true }
            });

            this.viewManager.notifySuccess("Operations", `The website is being published...`);
            this.viewManager.closeWorkshop("content-workshop");
        }
        catch (error) {
            this.viewManager.notifyError("Operations", `Unable to schedule publishing. Please try again later.`);
            this.logger.trackError(error);
        }
    }

    public async reset(): Promise<void> {
        const view: View = {
            heading: "Reset content",
            component: {
                name: "reset-details-workshop",
            }
        };
        this.viewManager.openViewAsWorkshop(view);
    }
}
