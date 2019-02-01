import * as ko from "knockout";
import template from "./schema-details.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { ApiService } from "../../../services/apiService";
import { SchemaObject } from "../../../models/schema";
import { Api } from "../../../models/api";

@Component({
    selector: "schema-details",
    template: template,
    injectable: "schemaDetails"
})
export class SchemaDetails {
    public definitions: KnockoutObservableArray<SchemaObject>;

    @Param()
    public api: KnockoutObservable<Api>;

    constructor(
        private readonly apiService: ApiService
    ) {
        this.onMounted = this.onMounted.bind(this);

        this.api = ko.observable();
        this.definitions = ko.observableArray([]);
    }

    @OnMounted()
    public onMounted(): void {
        this.loadSchemas();
    }

    private async loadSchemas(): Promise<void> {
        this.definitions([]);

        const pageOfSchemas = await this.apiService.getSchemas(this.api());
        const schemas = pageOfSchemas.value;

        // flatten schemas into list of schema objects
        const definitions = schemas.reduce((accumulator, currentValue) => accumulator.concat(currentValue.definitions), []);
        this.definitions(definitions);
    }
}