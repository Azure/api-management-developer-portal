import * as ko from "knockout";
import template from "./operation-details.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { ApiService } from "../../../../../services/apiService";
import { TypeDefinition } from "./../../../../../models/schema";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TenantService } from "../../../../../services/tenantService";


@RuntimeComponent({ selector: "operation-details" })
@Component({
    selector: "operation-details",
    template: template,
    injectable: "operationDetails"
})
export class OperationDetails {
    private definitions: ko.ObservableArray<TypeDefinition>;

    public readonly selectedApiName: ko.Observable<string>;
    public readonly selectedOperationName: ko.Observable<string>;
    public readonly consoleIsOpen: ko.Observable<boolean>;
    public readonly api: ko.Observable<Api>;
    public readonly schemas: ko.ObservableArray<string>;
    public readonly tags: ko.ObservableArray<string>;
    public readonly operation: ko.Observable<Operation>;
    public readonly requestUrlSample: ko.Computed<string>;
    public readonly hostname: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly tenantService: TenantService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.working = ko.observable(false);
        this.hostname = ko.observable();
        this.api = ko.observable();
        this.schemas = ko.observableArray([]);
        this.tags = ko.observableArray([]);
        this.operation = ko.observable();
        this.selectedApiName = ko.observable();
        this.selectedOperationName = ko.observable();
        this.consoleIsOpen = ko.observable();
        this.definitions = ko.observableArray<TypeDefinition>();
        this.requestUrlSample = ko.computed(() => {
            if (!this.api() || !this.operation()) {
                return null;
            }
            return `https://${this.hostname()}/${this.api().path}`.replace(/\/$/, "") + this.operation().urlTemplate;
        });
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const proxyHostnames = await this.tenantService.getProxyHostnames();
        const hostname = proxyHostnames[0];
        this.hostname(hostname);

        this.router.addRouteChangeListener(this.onRouteChange.bind(this));

        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        if (!apiName || !operationName) {
            return;
        }

        this.selectedApiName(apiName);
        this.selectedOperationName(operationName);

        await this.loadApi(apiName);
        await this.loadOperation(apiName, operationName);
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        if (apiName !== this.selectedApiName()) {
            this.selectedApiName(apiName);
            this.loadApi(apiName);
        }

        if (apiName !== this.selectedApiName() || operationName !== this.selectedOperationName()) {
            this.selectedOperationName(operationName);
            this.loadOperation(apiName, operationName);
        }
    }

    public async loadApi(apiName: string): Promise<void> {

        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.api(api);
    }

    public async loadOperation(apiName: string, operationName: string): Promise<void> {
        this.operation(null);
        this.working(true);

        if (!operationName) {
            return;
        }

        const operation = await this.apiService.getOperation(`apis/${apiName}/operations/${operationName}`);

        if (operation) {
            await this.loadDefinitions(operation);
            this.operation(operation);
        }
        else {
            this.cleanSelection();
        }

        const operationTags = await this.apiService.getOperationTags(`apis/${apiName}/operations/${operationName}`);
        this.tags(operationTags.map(tag => tag.name));

        this.working(false);
    }

    public async loadDefinitions(operation: Operation): Promise<void> {
        const schemaIds = [];
        const apiId = `apis/${this.selectedApiName()}/schemas/`;

        const prepresentations = operation.responses.map(response => response.representations)
            .concat(operation.request.representations)
            .flat();

        prepresentations
            .map(representation => representation.schemaId)
            .filter(schemaId => !!schemaId)
            .forEach(schemaId => {
                if (!schemaIds.includes(schemaId)) {
                    schemaIds.push(schemaId);
                }
            });

        const schemasPromises = schemaIds.map(schemaId => this.apiService.getApiSchema(`${apiId}${schemaId}`));
        const schemas = await Promise.all(schemasPromises);
        const definitions = schemas.map(x => x.definitions).flat();

        this.definitions(definitions);
    }

    private cleanSelection(): void {
        this.operation(null);
        this.closeConsole();
    }

    public openConsole(): void {
        this.consoleIsOpen(true);
    }

    public closeConsole(): void {
        this.consoleIsOpen(false);
    }

    public getDefinitionByTypeName(typeName: string): TypeDefinition {
        return this.definitions().find(x => x.name === typeName);
    }

    public getDefinitionReferenceUrl(definition: TypeDefinition): string {
        const apiName = this.selectedApiName();
        const operationName = this.selectedOperationName();

        return this.routeHelper.getDefinitionReferenceUrl(apiName, operationName, definition.name);
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}