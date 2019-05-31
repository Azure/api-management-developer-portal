import * as ko from "knockout";
import template from "./operation-details.html";
import { Component, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { Operation } from "../../../models/operation";
import { ApiService } from "../../../services/apiService";
import { DefaultRouteHandler, Route } from "@paperbits/common/routing";
import { Api } from "../../../models/api";
import { TenantService } from "../../../services/tenantService";

@RuntimeComponent({ selector: "operation-details" })
@Component({
    selector: "operation-details",
    template: template,
    injectable: "operationDetails"
})
export class OperationDetails {
    private currentUrl: string;
    private currentApiId: string;
    private operationId: string;
    private hostName: string;

    public selectedOperation: ko.Observable<Operation>;
    public api: ko.Observable<Api>;
    public operation: ko.Observable<Operation>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHandler: DefaultRouteHandler
    ) {
        this.api = ko.observable();
        this.operation = ko.observable();
        this.selectedOperation = ko.observable();

        this.openConsole = this.openConsole.bind(this);
        this.closeConsole = this.closeConsole.bind(this);
        this.loadOperation = this.loadOperation.bind(this);
        this.routeHandler.addRouteChangeListener(this.loadOperation);
    }

    public async loadOperation(route?: Route): Promise<void> {
        if (!route || !route.hash) {
            return;
        }

        const currentUrl = route.url;
        const currentHash = route.hash;

        if (currentUrl === this.currentUrl && this.operation()) {
            return;
        }

        this.currentUrl = currentUrl;

        const queryParams = new URLSearchParams(currentHash);
        if (!queryParams.has("operationId")) {
            this.cleanSelection();
            return;
        }

        if (!queryParams.has("apiId")) {
            this.cleanSelection();
            return;
        }
        const apiId = queryParams.get("apiId");
        if (apiId === "undefined" || apiId === "null") {
            this.cleanSelection();
            return;
        }

        this.currentApiId = apiId;
        const api = await this.apiService.getApi(`apis/${this.currentApiId}`);
        
        if (!api) {
            this.cleanSelection();
            return;
        }
        this.hostName = `https://${location.host}/${api.path}`;
        this.api(api);

        const operationId = queryParams.get("operationId");
        if (operationId === "undefined" || operationId === "null") {
            this.cleanSelection();
            return;
        }

        this.operationId = operationId;

        const operation = await this.apiService.getOperation(`apis/${this.currentApiId}/operations/${this.operationId}`);
        if (operation) {
            this.operation(operation);
        } else {
            this.cleanSelection();
        }
    }

    private cleanSelection(): void {
        this.hostName = `https://${location.host}`;
        this.operation(null);
        this.closeConsole();
    }

    public openConsole(): void {
        this.selectedOperation(this.operation());
    }

    public closeConsole(): void {
        this.selectedOperation(null);
    }
}