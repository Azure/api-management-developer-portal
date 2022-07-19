import * as ko from "knockout";
import template from "./graphql-doc.html";
import graphqlDocExplorer from "./graphql-doc-explorer.html";
import { Component, OnMounted, Param, OnDestroyed } from "@paperbits/common/ko/decorators";
import { GraphDocService } from "./graphql-doc-service";
import * as _ from "lodash";
import { GraphqlTypesForDocumentation, GraphqlCustomFieldNames } from "../../../../../../constants";

@Component({
    selector: "graphql-documentation",
    template: template,
    childTemplates: {
        graphqlDocExplorer: graphqlDocExplorer,
    }
})

export class GraphqlDocumentation {
    public readonly selectedType: ko.Observable<string>;
    public readonly filter: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    
    private koSubscriptions: ko.Subscription;

    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.working = ko.observable(true);
        this.detailsPageUrl = ko.observable();
        this.apiName = ko.observable<string>();
        this.filter = ko.observable("");
        this.selectedType = ko.observable<string>();
    }

    @Param()
    public apiName: ko.Observable<string>;

    @Param()
    public detailsPageUrl: ko.Observable<string>;


    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);
        await this.graphDocService.initialize();
        this.selectedType(GraphqlTypesForDocumentation[this.graphDocService.currentSelected()[GraphqlCustomFieldNames.type]()]);
        this.koSubscriptions = this.graphDocService.currentSelected.subscribe(this.onCurrentSelectedChange);
        this.working(false);
    }

    public getReferenceUrl(type: string, graphName: string): string {
        return this.graphDocService.routeHelper.getGraphReferenceUrl(this.apiName(), type, graphName, this.detailsPageUrl());
    }

    @OnDestroyed()
    public dispose(): void {
        this.koSubscriptions?.dispose();
        this.graphDocService.router.removeRouteChangeListener(this.graphDocService.onRouteChangeGraph);
    }

    public iteratorConverter(collection: string) {
        return _.values(this.graphDocService.docGraphs[collection]());
    }

    private onCurrentSelectedChange(selected: object): void {
        if (selected) {
            this.selectedType(GraphqlTypesForDocumentation[this.graphDocService.currentSelected()[GraphqlCustomFieldNames.type]()]);
        }
    }
}