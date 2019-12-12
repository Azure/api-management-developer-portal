import { Representation } from "./../../../../../models/representation";
import * as ko from "knockout";
import template from "./operation-details.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { ApiService } from "../../../../../services/apiService";
import { TypeDefinition, TypeDefinitionObjectProperty, TypeDefinitionProperty } from "../../../../../models/typeDefinition";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TenantService } from "../../../../../services/tenantService";
import { SwaggerObject } from "./../../../../../contracts/swaggerObject";
import { Utils } from "../../../../../utils";


@RuntimeComponent({ selector: "operation-details" })
@Component({
    selector: "operation-details",
    template: template,
    injectable: "operationDetails"
})
export class OperationDetails {
    private readonly definitions: ko.ObservableArray<TypeDefinition>;
    public readonly selectedApiName: ko.Observable<string>;
    public readonly selectedOperationName: ko.Observable<string>;
    public readonly consoleIsOpen: ko.Observable<boolean>;
    public readonly api: ko.Observable<Api>;
    public readonly schemas: ko.ObservableArray<string>;
    public readonly tags: ko.ObservableArray<string>;
    public readonly operation: ko.Observable<Operation>;
    public readonly requestUrlSample: ko.Computed<string>;
    public readonly primaryHostname: ko.Observable<string>;
    public readonly hostnames: ko.Observable<string[]>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly tenantService: TenantService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.working = ko.observable(false);
        this.primaryHostname = ko.observable();
        this.hostnames = ko.observable();
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

            const api = this.api();
            const operation = this.operation();
            const hostname = this.primaryHostname();
            const apiPath = api.versionedPath;
            const operationPath = operation.displayUrlTemplate;

            return `https://${hostname}/${apiPath}${operationPath}`;
        });
    }

    @Param()
    public enableConsole: boolean;

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.loadGatewayInfo();

        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        this.router.addRouteChangeListener(this.onRouteChange.bind(this));

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
            this.operation(null);

            if (operationName) {
                this.selectedOperationName(operationName);
                await this.loadOperation(apiName, operationName);
            }
        }
    }

    public async loadApi(apiName: string): Promise<void> {
        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.api(api);
    }

    public async loadOperation(apiName: string, operationName: string): Promise<void> {
        this.working(true);

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
        const apiId = `apis/${this.selectedApiName()}/schemas`;

        const prepresentations = operation.responses
            .map(response => response.representations)
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
        
        const typeNames = prepresentations.filter(p => !!p.typeName).map(p => p.typeName).filter((item, pos, self) => self.indexOf(item) === pos);

        const schemasPromises = schemaIds.map(schemaId => this.apiService.getApiSchema(`${apiId}/${schemaId}`));
        const schemas = await Promise.all(schemasPromises);
        const definitions = schemas.map(x => x.definitions).flat();

        let lookupResult = [...typeNames];
        while (lookupResult.length > 0) {            
            const references = definitions.filter(d => lookupResult.indexOf(d.name) !== -1);

            lookupResult = references.length === 0 ? [] : this.lookupReferences(references, typeNames);
            if (lookupResult.length > 0) {
                typeNames.push(...lookupResult);
            }
        } 

        this.definitions(definitions.filter(d => typeNames.indexOf(d.name) !== -1));
    }

    private lookupReferences(definitions: TypeDefinition[], skipNames: string[]): string[] {
        const objectDefinitions: TypeDefinitionProperty[] = definitions.map(r => r.properties).flat();
        return objectDefinitions.filter(p => p && p.type && (p.type.isReference || p.kind === "indexer") && skipNames.indexOf(p.type.name) === -1).map(d => d.type.name);
    }

    public async loadGatewayInfo(): Promise<void> {
        let hostnames = await this.tenantService.getProxyHostnames();

        if (hostnames.length === 0) {
            // TODO: Remove once setting backend serving the setting gets deployed.
            hostnames = await this.getProxyHostnames();
        }

        if (hostnames.length === 0) {
            throw new Error(`Unable to fetch gateway hostnames.`);
        }

        this.primaryHostname(hostnames[0]);
        this.hostnames(hostnames);
    }

    private cleanSelection(): void {
        this.operation(null);
        this.selectedOperationName(null);
        this.closeConsole();
    }

    public openConsole(): void {
        this.consoleIsOpen(true);
    }

    public closeConsole(): void {
        this.consoleIsOpen(false);
    }

    public getDefinitionForRepresentation(representation: Representation): TypeDefinition {
        let definition = this.definitions().find(x => x.name === representation.typeName);

        if (!definition) {
            // Fallback for the case when type is referenced, but not defined in schema.
            return new TypeDefinition(representation.typeName, {});
        }

        // Making copy to avoid overriding original properties.
        definition = Utils.clone(definition);

        if (!definition.name) {
            definition.name = representation.typeName;
        }

        if (representation.sample) {
            definition.example = representation.sample;

            if (representation.contentType.contains("/xml")) {
                definition.example = Utils.formatXml(representation.sample);
                definition.exampleFormat = "xml";
            }

            if (representation.contentType.contains("/json")) {
                definition.example = Utils.formatJson(representation.sample);
                definition.exampleFormat = "json";
            }
        }

        return definition;
    }

    public getDefinitionReferenceUrl(definition: TypeDefinition): string {
        const apiName = this.api().name;
        const operationName = this.operation().name;

        return this.routeHelper.getDefinitionAnchor(apiName, operationName, definition.name);
    }

    private async getProxyHostnames(): Promise<string[]> {
        const apiName = this.routeHelper.getApiName();

        if (!apiName) {
            return [];
        }

        const apiDefinition: SwaggerObject = await this.apiService.exportApi(`apis/${apiName}`, "swagger");
        return [apiDefinition.host];
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}