import * as ko from "knockout";
import template from "./type-definition.html";
import typeDefinitionEnum from "./type-definition-enum.html";
import typeDefinitionIndexer from "./type-definition-indexer.html";
import typeDefinitionObject from "./type-definition-object.html";
import typeDefinitionCombination from "./type-definition-combination.html";
import { Component, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { TypeDefinition } from "../../../../../models/typeDefinition";
import { RouteHelper } from "../../../../../routing/routeHelper";

@Component({
    selector: "type-definition",
    template: template,
    childTemplates: {
        typeDefinitionEnum: typeDefinitionEnum,
        typeDefinitionIndexer: typeDefinitionIndexer,
        typeDefinitionObject: typeDefinitionObject,
        typeDefinitionCombination: typeDefinitionCombination
    }
})
export class TypeDefinitionViewModel {
    public readonly name: ko.Observable<string>;
    public readonly description: ko.Observable<string>;
    public readonly kind: ko.Observable<string>;
    public readonly rawSchema: ko.Observable<string>;
    public readonly rawSchemaFormat: ko.Observable<string>;
    public readonly schemaView: ko.Observable<string>;

    constructor(private readonly routeHelper: RouteHelper) {
        this.name = ko.observable();
        this.description = ko.observable();
        this.kind = ko.observable();
        this.rawSchema = ko.observable();
        this.rawSchemaFormat = ko.observable();
        this.schemaView = ko.observable();
        this.defaultSchemaView = ko.observable();
    }

    @Param()
    public definition: TypeDefinition;

    @Param()
    public apiName: string;

    @Param()
    public operationName: string;

    @Param()
    public anchor: string;

    @Param()
    public defaultSchemaView: ko.Observable<string>;

    @OnMounted()
    public initialize(): void {
        this.schemaView(this.defaultSchemaView() || "table");
        this.rawSchema(this.definition.rawSchema);
        this.rawSchemaFormat(this.definition.rawSchemaFormat);

        this.name(this.definition.name);
        this.description(this.definition.description);
        this.kind(this.definition.kind);
    }

    public getReferenceId(definition: TypeDefinition): string {
        return this.routeHelper.getDefinitionReferenceId(this.apiName, this.operationName, definition.name);
    }

    public getReferenceUrl(typeName: string): string {
        return this.routeHelper.getDefinitionAnchor(this.apiName, this.operationName, typeName);
    }

    public switchToTable(): void {
        this.schemaView("table");
    }

    public switchToRaw(): void {
        this.schemaView("raw");
    }
}