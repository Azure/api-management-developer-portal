import * as ko from "knockout";
import template from "./graphql-doc-details.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { GraphDocService } from "./graphql-doc-service";
import { gqlFieldTypes, GraphqlTypesForDocumentation, gqlFieldNames } from "../../../../../../constants";
import * as GraphQL from "graphql";
import * as _ from "lodash";
import graphqlDocTable from "./graphql-doc-table.html";

@Component({
    selector: "graphql-details",
    template: template,
    childTemplates: {
        graphqlDocTable: graphqlDocTable,
    }
})

export class GraphqlDetails {

    public navigation: ko.ObservableArray<object>;

    public readonly working: ko.Observable<boolean>;
    public readonly gqlFieldTypes: Array<string>;

    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.navigation = ko.observableArray<object>([]);
        this.working = ko.observable(true);
        this.gqlFieldTypes = gqlFieldTypes;
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.graphDocService.currentSelected.subscribe(this.onCurrentSelectedChange);
    }

    private onCurrentSelectedChange(selected: object): void {
        if (selected) {
            this.navigation([this.graphDocService.currentSelected()]);
            this.working(false);
        }
    }

    public graphSelected() {
        const selectedIndex = this.navigation().length - 1;
        return this.navigation()[selectedIndex];
    }

    public getName(): string {
        return `${this.graphSelected()['name']} (${GraphqlTypesForDocumentation[this.graphSelected()[gqlFieldNames.type]()]})`
    }

    public getDescription(): string {
        const description = this.graphSelected()['description'];
        return (description) ? description : "No Description";
    }

    public getType(graph: object, side: string, isUnion = false): string {
        const fullTypeName = this.buildTypeName((isUnion) ? graph : graph['type']);
        return fullTypeName[side];
    }

    public addToNavigation(graph: object, isUnion = false): void {
        const graphName = this.getType(graph, 'name', isUnion);
        const type = this.graphDocService.indexCollectionFromType((isUnion) ? graph : graph['type']);
        const newGraph = this.graphDocService.docGraphs[type]()[graphName];
        this.navigation.push(newGraph);
    }

    public multipleGraphs(): boolean {
        return (this.navigation().length > 1);
    }

    public previousGraphName(): string {
        const previousGraph = this.previousGraph();
        return `${previousGraph['name']} (${GraphqlTypesForDocumentation[previousGraph[gqlFieldNames.type]()]})`;
    }

    public goBack(): void {
        this.navigation.pop();
    }

    private previousGraph(): object {
        const navigation = this.navigation();
        return navigation[navigation.length - 2];
    }

    private buildTypeName(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType): object {
        let tracking = [], complement = ["", ""];
        let fullTypeName = {};
        while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
            tracking.push(type instanceof GraphQL.GraphQLList);
            type = type.ofType;
        }
        fullTypeName['name'] = type.name;
        tracking.reverse();
        tracking.forEach(element => {
            if (element) {
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
        if (fieldName == '_fields') {
            fields = this.fieldValues(fields);
        }
        return (fields && fields.length > 0);
    }

    public fieldValues(fields: object): Array<object> {
        return _.values(fields);
    }

    public headerName(field: string): string {
        switch (field) {
            case "_types":
                return "Possible Types"
            case "_fields":
                return "Fields"
            case "_values":
                return "Values"
            default:
                return "Arguments";
        }
    }
}