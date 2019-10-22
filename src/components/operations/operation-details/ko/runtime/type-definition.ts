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

    constructor(private readonly routeHelper: RouteHelper) {
        this.example = ko.observable();
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

            if (this.representation.contentType.contains("/xml")) {
                example = Utils.formatXml(this.representation.sample);
            }

            if (this.representation.contentType.contains("/json")) {
                example = Utils.formatJson(this.representation.sample);
            }

            this.example(example);
        }
        else if (this.definition.example) {
            // Definition has always JSON example
            this.example(this.definition.example);
        }
    }

    public getReferenceId(definition: TypeDefinition): string {
        return this.routeHelper.getDefinitionReferenceId(this.apiName, this.operationName, definition.name);
    }

    public getReferenceUrl(definition: TypeDefinition): string {
        return this.routeHelper.getDefinitionReferenceUrl(this.apiName, this.operationName, definition.name);
    }
}