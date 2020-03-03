import { ViewManager } from "@paperbits/common/ui";
import template from "./cors.html";
import { Component } from "@paperbits/common/ko/decorators";
import { CorsPolicyHelper } from "./../../../helpers/corsPolicyHelper";


@Component({
    selector: "cors-help-workshop",
    template: template
})
export class CorsHelpWorkshop {
    constructor(
        private readonly corsPolicyHelper: CorsPolicyHelper,
        private readonly viewManager: ViewManager
    ) { }

    public async setupCors(): Promise<void> {
        await this.corsPolicyHelper.configureOrigins();
        this.viewManager.addToast("CORS policy", `CORS policy has been setup successfully.`);
    }
}