﻿import template from "./content.html";
import { ViewManager, View } from "@paperbits/common/ui";
import { Component } from "@paperbits/common/ko/decorators";
import { HttpClient } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { IAuthenticator } from "../../authentication/IAuthenticator";
import { AppError } from "./../../errors/appError";
import { MapiError } from "../../errors/mapiError";


@Component({
    selector: "content-workshop",
    template: template
})
export class ContentWorkshop {
    constructor(
        private readonly viewManager: ViewManager,
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
        private readonly logger: Logger
    ) {
        this.viewManager = viewManager;
    }

    public async publish(): Promise<void> {
        this.logger.traceEvent("Click: Publish website");

        if (!await this.authenticator.isAuthenticated()) {
            throw new AppError("Cannot publish website", new MapiError("Unauthorized", "You're not authorized."));
        }

        try {
            const accessToken = await this.authenticator.getAccessToken();

            const response = await this.httpClient.send({
                url: "/publish",
                method: "POST",
                headers: [{ name: "Authorization", value: accessToken }]
            });

            if (response.statusCode !== 200) {
                throw MapiError.fromResponse(response);
            }

            this.viewManager.notifySuccess("Operations", `The website is being published...`);
            this.viewManager.closeWorkshop("content-workshop");
        }
        catch (error) {
            this.viewManager.notifyError("Operations", `Unable to schedule publishing. Please try again later.`);
            this.logger.traceError(error);
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
