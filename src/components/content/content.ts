﻿import template from "./content.html";
import * as moment from "moment";
import * as Constants from "../../constants";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { Logger } from "@paperbits/common/logging";
import { IAuthenticator } from "../../authentication/IAuthenticator";
import { AppError } from "./../../errors/appError";
import { MapiError, MapiErrorCodes } from "../../errors/mapiError";
import { IApiClient } from "../../clients";


@Component({
    selector: "content-workshop",
    template: template
})
export class ContentWorkshop {
    constructor(
        private readonly viewManager: ViewManager,
        private readonly apiClient: IApiClient,
        private readonly authenticator: IAuthenticator,
        private readonly logger: Logger
    ) { }

    public async publish(): Promise<void> {
        this.logger.trackEvent("Publish", { message: "Click: Publish website" });

        if (!await this.authenticator.isAuthenticated()) {
            throw new AppError("Cannot publish website", new MapiError(MapiErrorCodes.Unauthorized, "You're not authorized."));
        }

        try {
            const revisionName = moment.utc().format(Constants.releaseNameFormat);

            await this.apiClient.put(`/portalRevisions/${revisionName}`, null, {
                properties: { description: "", isCurrent: true }
            });

            this.viewManager.notifySuccess("Operations", `The website is being published...`);
            this.viewManager.closeWorkshop("content-workshop");
        }
        catch (error) {
            this.viewManager.notifyError("Operations", `Unable to schedule publishing. Please try again later.`);
            this.logger.trackError(error, { message: "Unable to publish" });
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
