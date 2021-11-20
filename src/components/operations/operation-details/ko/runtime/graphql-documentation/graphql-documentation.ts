import * as ko from "knockout";
import * as GraphQL from "graphql";
import template from "./graphql-documentation.html";
import graphqlDocExplorer from "./graphql-doc-explorer.html";
import { Component, OnMounted, Param } from "@paperbits/common/ko/decorators";
import { Api } from "../../../../../../models/api";
import { GraphDocModel } from "./graphql-doc-model";
import { ApiService } from "../../../../../../services/apiService";
import { GraphqlOperationTypes } from "../../../../../../constants";
import { RouteHelper } from "../../../../../../routing/routeHelper";

@Component({
    selector: "graphql-documentation",
    template: template,
    childTemplates: {
        graphqlDocExplorer: graphqlDocExplorer,
    }
})

export class GraphqlDocumentation {

    public graphDocModel: ko.Observable<GraphDocModel>;

    public readonly filter: ko.Observable<string>;
    public readonly api: ko.Observable<Api>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly apiService: ApiService,
        private readonly routeHelper: RouteHelper
    ) {
        this.working = ko.observable(true);
        this.detailsPageUrl = ko.observable();
        this.apiName = ko.observable<string>();
        this.api = ko.observable<Api>();
        this.filter = ko.observable("");
        this.graphDocModel = ko.observable<GraphDocModel>();
    }

    @Param()
    public apiName: ko.Observable<string>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);

        await this.getApi();
        const graphQLSchemas = await this.apiService.getSchemas(this.api());
        const schema = graphQLSchemas.value.find(s => s.graphQLSchema)?.graphQLSchema;
        this.graphDocModel(new GraphDocModel(schema));
        this.working(false);
    }

    private async getApi(): Promise<void> {
        const apiName = this.apiName();
        if (!apiName) {
            return;
        }
        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.api(api)
    }
    
    public getReferenceUrl(graphName: string): string {
        return ""
        //return this.routeHelper.getOperationReferenceUrl(this.apiName(), graphName, this.detailsPageUrl());
    }
}