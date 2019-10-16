import * as ko from "knockout";
import template from "./operation-details.html";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { Operation } from "../../../../../models/operation";
import { ApiService } from "../../../../../services/apiService";
import { DefaultRouter, Route } from "@paperbits/common/routing";
import { Api } from "../../../../../models/api";
import { Utils } from "../../../../../utils";

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
    public schemas: ko.ObservableArray<string>;
    public operation: ko.Observable<Operation>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: DefaultRouter
    ) {
        this.api = ko.observable();
        this.schemas = ko.observableArray([]);
        this.operation = ko.observable();
        this.selectedOperation = ko.observable();

        this.openConsole = this.openConsole.bind(this);
        this.closeConsole = this.closeConsole.bind(this);
        this.loadOperation = this.loadOperation.bind(this);
        this.scrollToSchema = this.scrollToSchema.bind(this);
    }

    @OnMounted()
    public async init() {
        await this.loadOperation(this.router.getCurrentRoute());
        this.router.addRouteChangeListener(this.loadOperation);
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
            this.getSchemas();
            if (this.selectedOperation()) {
                this.openConsole();
            }
        } else {
            this.cleanSelection();
        }
    }

    public getSchemas() {
        const operation = this.operation();
        const schemas = [];
        const apiId = `${this.api().id}/schemas/`;
        if (operation && operation.responses &&  operation.responses.length > 0) {
            operation.responses.map(res => 
                res.representations && res.representations.map(rep => 
                    rep.schemaId && schemas.indexOf(`${apiId}${rep.schemaId}`) === -1 && schemas.push(`${apiId}${rep.schemaId}`)
                ));
        }
        this.schemas(schemas);
    }

    private cleanSelection(): void {
        this.hostName = `https://${location.host}`;
        this.operation(null);
        this.closeConsole();
    }

    public scrollToSchema(item) {
        Utils.scrollTo(item.typeName);
    }

    public openConsole(): void {
        this.selectedOperation(this.operation());
    }

    public closeConsole(): void {
        this.selectedOperation(null);
    }

    public dispose(): void {
        this.router.removeRouteChangeListener(this.loadOperation);
    }
}