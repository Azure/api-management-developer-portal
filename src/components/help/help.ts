import * as ko from "knockout";
import cors from "./articles/cors.html";
import domain from "./articles/domain.html";
import { PolicyService } from "./../../services/policyService";
import template from "./help.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { View, ViewManager } from "@paperbits/common/ui";
import { Hint } from "./hint";


@Component({
    selector: "help-workshop",
    template: template
})
export class HelpWorkshop {
    public readonly hints: ko.ObservableArray<Hint>;

    public constructor(
        private readonly policyService: PolicyService,
        private readonly viewManager: ViewManager
    ) {
        this.hints = ko.observableArray();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const globalPolicyXml = await this.policyService.getPolicyXmlForGlobalScope();

        if (!globalPolicyXml.toLowerCase().contains("<cors>")) {
            this.hints.push({
                issue: `Setup CORS policy`,
                suggestion: cors
            });
        }

        if (location.hostname.endsWith(".developer.azure-api") || location.hostname.endsWith("localhost")) {
            this.hints.push({
                issue: `Setup custom domain`,
                suggestion: domain
            });
        }
    }

    public selectHint(hint: Hint): void {
        const view: View = {
            heading: hint.issue,
            component: {
                name: "help-details-workshop",
                params: {
                    hint: hint
                }
            }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}
