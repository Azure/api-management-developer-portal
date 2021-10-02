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
import { OAuthService } from "../../../../../services/oauthService";


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
    public readonly apiType: ko.Observable<string>;
    public readonly protocol: ko.Computed<string>;

    constructor(
        private readonly apiService: ApiService,
        private readonly oauthService: OAuthService,
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
        this.useCorsProxy = ko.observable();
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

            if (api.type === TypeOfApi.webSocket) {
                return `${hostname}${Utils.ensureLeadingSlash(operationPath)}`;
            }

            return `https://${hostname}${Utils.ensureLeadingSlash(operationPath)}`;
        });
        this.protocol = ko.computed(() => {
            const api = this.api();

            if (!api) {
                return null;
            }

            return api.protocols?.join(", ");
        });
        this.apiType = ko.observable();
    }

    @Param()
    public enableConsole: boolean;

    @Param()
    public useCorsProxy: ko.Observable<boolean>;

    @Param()
    public enableScrollTo: boolean;

    @Param()
    public defaultSchemaView: ko.Observable<string>;

    @OnMounted()
    public async initialize(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        this.selectedApiName(apiName);
        this.selectedOperationName(operationName);
        this.router.addRouteChangeListener(this.onRouteChange.bind(this));

        if (apiName) {
            await this.loadApi(apiName);
        }

        if (operationName) {
            await this.loadOperation(apiName, operationName);
        }
    }

    private async onRouteChange(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();

        if (apiName && apiName !== this.selectedApiName()) {
            this.selectedApiName(apiName);
            await this.loadApi(apiName);
        }

        if (apiName === this.selectedApiName() && operationName === this.selectedOperationName()) {
            return;
        }

        if (!operationName) {
            this.selectedOperationName(null);
            this.operation(null);
            return;
        }

        if (apiName && operationName) {
            this.selectedOperationName(operationName);
            await this.loadOperation(apiName, operationName);
        }
    }

    public async loadApi(apiName: string): Promise<void> {
        if (!apiName) {
            return;
        }

        const api = await this.apiService.getApi(`apis/${apiName}`);

        if (!api) {
            return;
        }

        await this.loadGatewayInfo(apiName);
        this.apiType(api?.type);
        this.api(api);

        this.closeConsole();

        const associatedServerId = api.authenticationSettings?.oAuth2?.authorizationServerId ||
            api.authenticationSettings?.openid?.openidProviderId;

        let associatedAuthServer = null;

        if (associatedServerId) {
            associatedAuthServer = await this.oauthService.getAuthServer(api.authenticationSettings?.oAuth2?.authorizationServerId, api.authenticationSettings?.openid?.openidProviderId);
        }

        this.associatedAuthServer(associatedAuthServer);
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

        if (this.enableScrollTo) {
            const headerElement = document.querySelector(".operation-header");
            headerElement && headerElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
        }
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

        this.definitions(definitions.filter(definition => typeNames.indexOf(definition.name) !== -1));
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
                || definition.type instanceof TypeDefinitionPropertyTypeArrayOfReference)) {
                result.push(definition.type.name);
            }

            if (definition.type instanceof TypeDefinitionPropertyTypeCombination) {
                result.push(...definition.type.combination.map(x => x["name"]));
            }
        });

        return result.filter(x => !skipNames.includes(x));
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

        if (representation.examples?.length > 0) {
            definition.example = representation.examples[0].value;
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