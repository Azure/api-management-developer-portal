import * as ko from "knockout";
import template from "./api-details.html";
import { Component, OnMounted, RuntimeComponent } from "@paperbits/common/ko/decorators";
import { DefaultRouteHandler } from "@paperbits/common/routing";
import { ApiService } from "../../../services/apiService";
import { Operation } from "../../../models/operation";
import { Api } from "../../../models/api";

@RuntimeComponent({ selector: "api-details" })
@Component({
    selector: "api-details",
    template: template,
    injectable: "apiDetails"
})
export class ApiDetails {
    public api: ko.Observable<Api> = null;
    public operations: ko.ObservableArray<Operation> = null;
    public selectedOperation: ko.Observable<Operation>;
    public working: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHandler: DefaultRouteHandler
    ) {
        this.api = ko.observable();
        this.operations = ko.observableArray();
        this.selectedOperation = ko.observable();
        this.working = ko.observable(false);

        this.routeHandler.addRouteChangeListener(this.loadApi.bind(this));
    }

    @OnMounted()
    public async loadApi(): Promise<void> {
        this.api(null);
        this.selectedOperation(null);

        const apiName = this.routeHandler.getHash();

        if (!apiName) {
            return;
        }

        this.working(true);

        if (apiName) {
            const api = await this.apiService.getApi(`apis/${apiName}`);

            await this.loadOperations(api);
            this.api(api);
        }

        this.working(false);
    }

    private async loadOperations(api: Api): Promise<void> {
        const pageOfOperations = await this.apiService.getOperations(api);
        this.operations(pageOfOperations.value);
    }

    public openConsole(operation: Operation): void {
        this.selectedOperation(operation);
    }

    public closeConsole(): void {
        this.selectedOperation(null);
    }
}