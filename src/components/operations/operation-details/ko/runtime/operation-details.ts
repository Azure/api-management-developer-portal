import * as ko from "knockout";
import template from "./operation-details.html";
import { Router } from "@paperbits/common/routing";
import { Component, RuntimeComponent, OnMounted, OnDestroyed, Param } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { ApiService } from "../../../../../services/apiService";
import { TypeDefinitionPropertyTypeCombination } from "./../../../../../models/typeDefinition";
import { AuthorizationServer } from "./../../../../../models/authorizationServer";
import { Representation } from "./../../../../../models/representation";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Utils } from "../../../../../utils";
import { TypeOfApi } from "../../../../../constants";
import {
    TypeDefinition,
    TypeDefinitionProperty,
    TypeDefinitionPropertyTypeReference,
    TypeDefinitionPropertyTypeArrayOfReference,
    TypeDefinitionPropertyTypeArrayOfPrimitive
} from "../../../../../models/typeDefinition";


@RuntimeComponent({
    selector: "operation-details"
})
@Component({
    selector: "operation-details",
    template: template
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
    public readonly sampleHostname: ko.Observable<string>;
    public readonly hostnames: ko.Observable<string[]>;
    public readonly working: ko.Observable<boolean>;
    public readonly associatedAuthServer: ko.Observable<AuthorizationServer>;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.working = ko.observable(false);
        this.sampleHostname = ko.observable();
        this.hostnames = ko.observable();
        this.associatedAuthServer = ko.observable();
        this.api = ko.observable();
        this.schemas = ko.observableArray([]);
        this.tags = ko.observableArray([]);
        this.operation = ko.observable();
        this.selectedApiName = ko.observable();
        this.selectedOperationName = ko.observable();
        this.consoleIsOpen = ko.observable();
        this.definitions = ko.observableArray<TypeDefinition>();
        this.defaultSchemaView = ko.observable("table");
        this.requestUrlSample = ko.computed(() => {
            if (!this.api() || !this.operation()) {
                return null;
            }

            const api = this.api();
            const operation = this.operation();
            const hostname = this.sampleHostname();

            let operationPath = api.versionedPath;

            if (api.type !== TypeOfApi.soap) {
                operationPath += operation.displayUrlTemplate;
            }

            return `https://${hostname}${Utils.ensureLeadingSlash(operationPath)}`;
        });
    }

    @Param()
    public enableConsole: boolean;

    @Param()
    public authorizationServers: AuthorizationServer[];

    @Param()
    public defaultSchemaView: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        this.selectedApiName(apiName);
        this.selectedOperationName(operationName);

        if (apiName) {
            await this.loadGatewayInfo(apiName);
            await this.loadApi(apiName);
        }

        if (operationName) {
            await this.loadOperation(apiName, operationName);
        }

        this.router.addRouteChangeListener(this.onRouteChange.bind(this));
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        if (apiName && apiName !== this.selectedApiName()) {
            this.selectedApiName(apiName);
            this.loadApi(apiName);
        }

        if (apiName !== this.selectedApiName() || operationName !== this.selectedOperationName()) {
            this.operation(null);

            if (apiName && operationName) {
                this.selectedOperationName(operationName);
                await this.loadOperation(apiName, operationName);
            }
        }
    }

    public async loadApi(apiName: string): Promise<void> {
        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.api(api);

        if (this.authorizationServers) {
            const associatedAuthServer = this.authorizationServers
                .find(x => x.id === api.authenticationSettings?.oAuth2?.authorizationServerId);

            this.associatedAuthServer(associatedAuthServer);
        }
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

        const representations = operation.responses
            .map(response => response.representations)
            .concat(operation.request.representations)
            .flat();

        representations
            .map(representation => representation.schemaId)
            .filter(schemaId => !!schemaId)
            .forEach(schemaId => {
                if (!schemaIds.includes(schemaId)) {
                    schemaIds.push(schemaId);
                }
            });

        const typeNames = representations
            .filter(p => !!p.typeName)
            .map(p => p.typeName)
            .filter((item, pos, self) => self.indexOf(item) === pos);

        const schemasPromises = schemaIds.map(schemaId => this.apiService.getApiSchema(`${apiId}/${schemaId}`));
        const schemas = await Promise.all(schemasPromises);
        const definitions = schemas.map(x => x.definitions).flat();

        let lookupResult = [...typeNames];

        while (lookupResult.length > 0) {
            const references = definitions.filter(definition => lookupResult.indexOf(definition.name) !== -1);

            lookupResult = references.length === 0
                ? []
                : this.lookupReferences(references, typeNames);

            if (lookupResult.length > 0) {
                typeNames.push(...lookupResult);
            }
        }

        this.definitions(definitions.filter(d => typeNames.indexOf(d.name) !== -1));
    }

    private lookupReferences(definitions: TypeDefinition[], skipNames: string[]): string[] {
        const result = [];
        const objectDefinitions: TypeDefinitionProperty[] = definitions
            .map(definition => definition.properties)
            .filter(definition => !!definition)
            .flat();

        objectDefinitions.forEach(definition => {
            if (definition.kind === "indexed") {
                result.push(definition.type["name"]);
            }

            if ((definition.type instanceof TypeDefinitionPropertyTypeReference
                || definition.type instanceof TypeDefinitionPropertyTypeArrayOfPrimitive
                || definition.type instanceof TypeDefinitionPropertyTypeArrayOfReference)
                && !skipNames.includes(definition.type.name)) {
                result.push(definition.type.name);
            }

            if (definition.type instanceof TypeDefinitionPropertyTypeCombination) {
                result.push(...definition.type.combination.map(x => x["name"]));
            }
        });

        return result;
    }

    public async loadGatewayInfo(apiName: string): Promise<void> {
        const hostnames = await this.apiService.getApiHostnames(apiName);

        if (hostnames.length === 0) {
            throw new Error(`Unable to fetch gateway hostnames.`);
        }

        this.sampleHostname(hostnames[0]);
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

        if (representation.example) {
            definition.example = representation.example;
            definition.exampleFormat = representation.exampleFormat;
        }

        return definition;
    }

    public getDefinitionReferenceUrl(definition: TypeDefinition): string {
        const apiName = this.api().name;
        const operationName = this.operation().name;

        return this.routeHelper.getDefinitionAnchor(apiName, operationName, definition.name);
    }

    @OnDestroyed()
    public dispose(): void {
        this.router.removeRouteChangeListener(this.onRouteChange);
    }
}