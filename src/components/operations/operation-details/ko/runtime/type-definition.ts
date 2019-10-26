import * as ko from "knockout";
import template from "./type-definition.html";
import { Component, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { TypeDefinition } from "../../../../../models/schema";
import { Representation } from "./../../../../../models/representation";
import { Utils } from "../../../../../utils";
import { RouteHelper } from "../../../../../routing/routeHelper";

@Component({
    selector: "type-definition",
    template: template,
    injectable: "typeDefinition"
})
export class TypeDefinitionViewModel {
    public example: ko.Observable<string>;
    public exampleLanguage: ko.Observable<string>;
    public type: ko.Observable<string>;

    constructor(private readonly routeHelper: RouteHelper) {
        this.example = ko.observable();
        this.exampleLanguage = ko.observable();
        this.type = ko.observable();
    }

    @Param()
    public definition: TypeDefinition;

    @Param()
    public apiName: string;

    @Param()
    public operationName: string;

    @Param()
    public representation: Representation;

    @Param()
    public anchor: string;

    @OnMounted()
    public initialize(): void {
        if (this.representation && this.representation.sample) {
            let example;
            let exampleLanguage = "none";

            if (this.representation.contentType.contains("/xml")) {
                example = Utils.formatXml(this.representation.sample);
                exampleLanguage = "xml";
            }

            if (this.representation.contentType.contains("/json")) {
                example = Utils.formatJson(this.representation.sample);
                exampleLanguage = "json";
            }

            this.exampleLanguage(exampleLanguage);
            this.example(example);
        }
        else if (this.definition.example) {
            // Definition has always JSON example
            this.exampleLanguage("json");
            this.example(this.definition.example);
        }

        this.type(this.definition.uiType);
    }

    public getReferenceId(definition: TypeDefinition): string {
        return this.routeHelper.getDefinitionReferenceId(this.apiName, this.operationName, definition.name);
    }

    public getReferenceUrl(definition: TypeDefinition): string {
        return this.routeHelper.getDefinitionAnchor(this.apiName, this.operationName, definition.referencedTypeName);
    }
}