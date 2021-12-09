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

    public readonly selectedType: ko.Observable<string>;
    public readonly availableTypes: ko.ObservableArray<string>;
    public readonly filter: ko.Observable<string>;
    public readonly typeIndexer: ko.Observable<object>;
    
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.working = ko.observable(true);
        this.detailsPageUrl = ko.observable();
        this.apiName = ko.observable<string>();
        this.filter = ko.observable("");
        this.typeIndexer = ko.observable();
        this.selectedType = ko.observable<string>();
        this.availableTypes = ko.observableArray<string>();
    }

    @Param()
    public apiName: ko.Observable<string>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);
        await this.graphDocService.initialize();
        this.getAvailableTypes();
        this.selectedType(GraphqlTypesForDocumentation[this.graphDocService.currentSelected()['collectionTypeForDoc']()]);
        this.graphDocService.navigation.subscribe(this.onNavigationChange);
        this.working(false);
    }

    public getReferenceUrl(type: string, graphName: string): string {
        return this.graphDocService.routeHelper.getGraphReferenceUrl(this.apiName(), type, graphName, DocumentationActions.global, this.detailsPageUrl());
    }

    @OnDestroyed()
    public dispose(): void {
        this.graphDocService.router.removeRouteChangeListener(this.graphDocService.onRouteChangeGraph);
    }

    public iteratorConverter(collection: string) {
        return _.values(this.graphDocService.docGraphs[collection]());
    }

    private onNavigationChange(selected: Array<object>): void {
        if (selected.length > 0) {
            this.selectedType(GraphqlTypesForDocumentation[this.graphDocService.currentSelected()['collectionTypeForDoc']()]);
        }
    }

    private getAvailableTypes() {
        let indexer = {};
        let availableTypes = [];

        const availables = _.keys(this.graphDocService.docGraphs);

        _.each(GraphqlTypesForDocumentation, (v,k) => {
            if(_.includes(availables, k)) {
                indexer[v] = k;
                availableTypes.push(v);
            }
        })

        this.typeIndexer(indexer);
        this.availableTypes(availableTypes);
    }
}