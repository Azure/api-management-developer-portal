import * as ko from "knockout";
import cors from "./articles/cors.html";
import domain from "./articles/domain.html";
import template from "./help.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { View, ViewManager } from "@paperbits/common/ui";
import { Hint } from "./hint";
import { CorsPolicyHelper } from "./../../helpers/corsPolicyHelper";


@Component({
    selector: "help-workshop",
    template: template
})
export class HelpWorkshop {
    public readonly hints: ko.ObservableArray<Hint>;

    public constructor(
        private readonly viewManager: ViewManager,
        private readonly corsPolicyHelper: CorsPolicyHelper
    ) {
        this.hints = ko.observableArray();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        if (location.hostname.endsWith(".developer.azure-api") || location.hostname.endsWith("localhost")) {
            this.hints.push({
                issue: `Setup custom domain`,
                suggestion: domain
            });
        }

        const domains = await this.corsPolicyHelper.getConfiguredOrigins();

        if (domains.length === 0) {
            this.hints.push({
                issue: `Setup CORS policy`,
                suggestion: cors,
                component: {
                    name: "cors-help-workshop",
                }
            });
        }
    }

    public selectHint(hint: Hint): void {
        const helpDetailsComponent = hint.component || {
            name: "help-details-workshop",
            params: {
                hint: hint
            }
        };

        const view: View = {
            heading: hint.issue,
            component: helpDetailsComponent
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}
