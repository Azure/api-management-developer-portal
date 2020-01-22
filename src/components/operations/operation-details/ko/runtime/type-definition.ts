import * as ko from "knockout";
import template from "./type-definition.html";
import { Component, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { TypeDefinition } from "../../../../../models/typeDefinition";
import { RouteHelper } from "../../../../../routing/routeHelper";

@Component({
    selector: "type-definition",
    template: template
})
export class TypeDefinitionViewModel {
    public readonly name: ko.Observable<string>;
    public readonly description: ko.Observable<string>;
    public readonly kind: ko.Observable<string>;
    public readonly example: ko.Observable<string>;
    public readonly exampleLanguage: ko.Observable<string>;

    constructor(private readonly routeHelper: RouteHelper) {
        this.name = ko.observable();
        this.description = ko.observable();
        this.kind = ko.observable();
        this.example = ko.observable();
        this.exampleLanguage = ko.observable();
    }

    @Param()
    public definition: TypeDefinition;

    @Param()
    public apiName: string;

    @Param()
    public operationName: string;

    @Param()
    public anchor: string;

    @OnMounted()
    public initialize(): void {
        this.name(this.definition.name);
        this.description(this.definition.description);
        this.kind(this.definition.kind);

        if (this.definition.example) {
            this.exampleLanguage(this.definition.exampleFormat);
            this.example(this.definition.example);
        }
    }

    public getReferenceId(definition: TypeDefinition): string {
        return this.routeHelper.getDefinitionReferenceId(this.apiName, this.operationName, definition.name);
    }

    public getReferenceUrl(typeName: string): string {
        return this.routeHelper.getDefinitionAnchor(this.apiName, this.operationName, typeName);
    }
}