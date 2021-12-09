import * as ko from "knockout";
import template from "./graphql-doc.html";
import graphqlDocExplorer from "./graphql-doc-explorer.html";
import { Component, OnMounted, Param, OnDestroyed } from "@paperbits/common/ko/decorators";
import { GraphDocService } from "./graphql-doc-service";
import * as _ from "lodash";
import { GraphqlTypesForDocumentation, DocumentationActions } from "../../../../../../constants";

@Component({
    selector: "graphql-documentation",
    template: template,
    childTemplates: {
        graphqlDocExplorer: graphqlDocExplorer,
    }
})

export class GraphqlDocumentation {

    public readonly graphqlTypes: ko.ObservableArray<object>;
    public readonly filter: ko.Observable<string>;
    
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.working = ko.observable(true);
        this.detailsPageUrl = ko.observable();
        this.apiName = ko.observable<string>();
        this.filter = ko.observable("");
        this.graphqlTypes = ko.observableArray<object>();
    }

    @Param()
    public apiName: ko.Observable<string>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);
        this.graphqlTypes(_.map(GraphqlTypesForDocumentation, (v,i) => {
            return {index: i, name: v}
        }));
        await this.graphDocService.initialize();
        this.working(false);
    }

    public getReferenceUrl(type: string, graphName: string): string {
        return this.graphDocService.routeHelper.getGraphReferenceUrl(this.apiName(), type, graphName, DocumentationActions.global, this.detailsPageUrl());
    }

    @OnDestroyed()
    public dispose(): void {
        this.graphDocService.router.removeRouteChangeListener(this.graphDocService.onRouteChangeGraph);
    }

    private iteratorConverter(collection: string) {
        return _.values(this.graphDocService.docGraphs[collection]());
    }
}