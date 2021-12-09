import * as ko from "knockout";
import template from "./graphql-doc-details.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { GraphDocService } from "./graphql-doc-service";
import { DocumentationActions } from "../../../../../../constants";
import * as GraphQL from "graphql";
import * as _ from "lodash";
import { Value } from "liquidjs";

@Component({
    selector: "graphql-details",
    template: template
})

export class GraphqlDetails {

    public readonly working: ko.Observable<boolean>;
    public readonly graphSelected: ko.Observable<object>;

    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.working = ko.observable(true);
        this.graphSelected = ko.observable();
    }


    @OnMounted()
    public async initialize(): Promise<void> {
        this.graphDocService.navigation.subscribe(this.onNavigationChange);
    }

    private onNavigationChange(selected: Array<object>): void {
        if (selected.length > 0) {
            this.graphSelected(this.graphDocService.currentSelected());
            this.working(false);
        }
    }

    public getName(): string {
        const name = this.graphSelected()['name'];
        return (name) ? name : "No Name";
    }

    public getDescription(): string {
        const description = this.graphSelected()['description'];
        return (description) ? description : "No Description";
    }

    public getType(graph: object, side: string): string {
        const fullTypeName = this.buildTypeName(graph['type']);
        return fullTypeName[side];
    }

    public selectType(graph: object): string {
        const graphName = this.getType(graph, 'name');
        const type = this.graphDocService.indexCollectionFromType(graph["type"]);
        return this.graphDocService.routeHelper.getGraphReferenceUrl(this.graphDocService.selectedApiName(), type, graphName, DocumentationActions.details);
    }

    public multipleGraphs(): boolean {
        return (this.graphDocService.navigation().length > 1);
    }
    
    public previousGraphName(): string {
        const previousGraph = this.previousGraph();
        return `${previousGraph['name']} (${previousGraph['collectionTypeForDoc']()})`;
    }

    public goBack(): string {
        const previousGraph = this.previousGraph();
        const type = previousGraph['collectionTypeForDoc']();
        const graphName = previousGraph["name"];
        return this.graphDocService.routeHelper.getGraphReferenceUrl(this.graphDocService.selectedApiName(), type, graphName, DocumentationActions.back);
    }

    private previousGraph(): object {
        const navigation = this.graphDocService.navigation();
        return navigation[navigation.length - 2];
    }

    private buildTypeName(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType): object {
        let tracking = [], complement = [ "", "" ];
        let fullTypeName = {};
        while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
            tracking.push(type instanceof GraphQL.GraphQLList);
            type = type.ofType;
        }
        fullTypeName['name'] = type.name;
        tracking.reverse();
        tracking.forEach(element => {
            if(element) {
                complement[0] += '[';
                complement[1] += ']'
            }
            else {
                complement[1] += '!'
            }
        });
        fullTypeName['left'] = complement[0];
        fullTypeName['right'] = complement[1];
        return fullTypeName;
    }

    public hasField(fieldName: string): boolean {
        let fields = this.graphSelected()[fieldName];
        if(fieldName == '_fields') {
            fields = this.fieldValues(fields);
        }
        return (fields && fields.length > 0);
    }

    public keyName(keyName: string): string {
        return keyName + ': ';
    }

    public fieldValues(fields: object): Array<object> {
        return _.values(fields);
    }
}