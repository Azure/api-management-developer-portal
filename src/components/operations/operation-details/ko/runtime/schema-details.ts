import * as ko from "knockout";
import template from "./schema-details.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../../../services/apiService";
import { TypeDefinition } from "../../../../../models/schema";

@Component({
    selector: "schema-details",
    template: template,
    injectable: "schemaDetails"
})
export class SchemaDetails {
    public readonly working: ko.Observable<boolean>;
    public definitions: ko.ObservableArray<TypeDefinition>;

    @Param()
    public schemas: ko.ObservableArray<string>;

    constructor(
        private readonly apiService: ApiService
    ) {
        this.schemas = ko.observableArray();
        this.definitions = ko.observableArray([]);
        this.working = ko.observable(true);
    }

    @OnMounted()
    public onMounted(): void {
        this.schemas.subscribe(this.loadSchemas);
    }

    private async loadSchemas(): Promise<void> {
        this.working(true);
        this.definitions([]);

        const ids = this.schemas();
        const schemasPromises = ids.map(id => this.apiService.getApiSchema(id));
        const schemas = await Promise.all(schemasPromises);

        // flatten schemas into list of schema objects
        const definitions = schemas.reduce((accumulator, currentValue) => accumulator.concat(currentValue.definitions), []);
        this.definitions(definitions);
        this.working(false);
    }
}