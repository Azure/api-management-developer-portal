import * as ko from "knockout";
import template from "./graphql-doc-details.html";
import { Component, OnDestroyed, OnMounted } from "@paperbits/common/ko/decorators";
import { GraphDocService } from "./graphql-doc-service";
import { GraphqlFieldTypes, GraphqlTypesForDocumentation, GraphqlCustomFieldNames, GraphqlDefaultScalarTypes } from "../../../../../../constants";
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
    public graphSelected: ko.Observable<object>;
    public graphSelectedSchemaView: ko.Observable<string>;
    public graphSelectedType: ko.Observable<object>;

    public readonly working: ko.Observable<boolean>;
    public readonly gqlFieldTypes: string[];
    public allReferences: {
        objectType: ko.ObservableArray<string>,
        inputObjectType: ko.ObservableArray<string>,
        enumType: ko.ObservableArray<string>,
        scalarType: ko.ObservableArray<string>,
        unionType: ko.ObservableArray<string>,
        interfaceType: ko.ObservableArray<string>
    };
    public allReferencesList: ko.ObservableArray<object>;
    private referenceQueue: Array<object>;
    private koSubscription: ko.Subscription;


    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.working = ko.observable(true);
        this.gqlFieldTypes = _.values(GraphqlFieldTypes);
        this.graphSelected = ko.observable<object>();
        this.graphSelectedSchemaView = ko.observable<string>("table");
        this.graphSelectedType = ko.observable<object>();
        this.allReferencesList = ko.observableArray<object>([]);
        this.onCurrentSelectedChange =this.onCurrentSelectedChange.bind(this);
    }


    @OnMounted()
    public async initialize(): Promise<void> {
        this.koSubscription = this.graphDocService.currentSelected.subscribe(this.onCurrentSelectedChange);
        const selected = this.graphDocService.currentSelected();
        this.onCurrentSelectedChange(selected);
    }

    @OnDestroyed()
    public dispose(): void {
        this.koSubscription?.dispose();
    }

    private onCurrentSelectedChange(selected: object): void {
        if (selected) {
            this.working(true);
            this.graphSelected(selected);
            this.allReferences = {
                objectType: ko.observableArray<string>([]),
                inputObjectType: ko.observableArray<string>([]),
                enumType: ko.observableArray<string>([]),
                scalarType: ko.observableArray<string>([]),
                unionType: ko.observableArray<string>([]),
                interfaceType: ko.observableArray<string>([])
            };
            this.referenceQueue = [];
            this.buildReferences();
            this.allReferencesList(this.convertToList(this.allReferences));
            this.working(false);
        }
    }

    public getName(): string {
        return `${this.graphSelected()["name"]}`;
    }

    public getDescription(reference: object, isSelected = false): string {
        if (isSelected) {
            return this.graphSelected()["description"];
        }
        else {
            const referenceType = this.graphDocService.docGraphs[reference["type"]];
            if (referenceType) {
                const refName = reference["name"];
                const ref = referenceType && referenceType()[refName];
                return ref?.description;
            }
        }
    }

    public getType(graph: object, side: string, isUnion = false): string {
        const fullTypeName = this.buildTypeName((isUnion) ? graph : graph["type"]);
        return fullTypeName[side];
    }

    private buildTypeName(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType): object {
        const tracking = [], complement = ["", ""];
        const fullTypeName = {};
        while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
            tracking.push(type instanceof GraphQL.GraphQLList);
            type = type.ofType;
        }
        fullTypeName["name"] = type.name;
        tracking.reverse();
        tracking.forEach(element => {
            if (element) {
                complement[0] += "[";
                complement[1] += "]";
            }
            else {
                complement[1] += "!";
            }
        });
        fullTypeName["left"] = complement[0];
        fullTypeName["right"] = complement[1];
        return fullTypeName;
    }

    public hasField(fieldName: string): boolean {
        let fields = this.graphSelected()[fieldName];
        if (fieldName == GraphqlFieldTypes.fields) {
            fields = this.fieldValues(fields);
        }
        return (fields && fields.length > 0);
    }

    public fieldValues(fields: object): object[] {
        return _.values(fields);
    }

    public headerName(field: string): string {
        switch (field) {
            case "unionType":
                return "Possible Types";
            case "inputObjectType": case "objectType": case "interfaceType":
                return "Fields";
            case "enumType":
                return "Values";
            default:
                return "Arguments";
        }
    }

    public buildReferences(): void {
        const selected = this.graphSelected();
        const selectedType = this.fullType(selected);

        this.graphSelectedType(selectedType);
        this.addingReferences(selectedType);
        this.fieldIterator(selected, GraphqlFieldTypes.args)

        while (this.referenceQueue.length > 0) {
            const head = this.referenceQueue.shift();
            const graph = this.graphDocService.docGraphs[head["type"]]()[head["name"]];
            if (graph) {
                _.each(_.values(GraphqlFieldTypes), (f) => {
                    this.fieldIterator(graph, f);
                });
            }
        }
    }

    private fieldIterator(graph: object, field: string): void {
        const children = (field == GraphqlFieldTypes.args || field == GraphqlFieldTypes.types) ? graph[field] : _.values(graph[field]);
        if (children && children.length > 0) {
            _.each(children, (child) => {
                this.addingReferences(this.fullType(child, field == GraphqlFieldTypes.types));
            });
        }
    }

    public fullType(graph: object, isUnion = false): object {
        const type = this.graphDocService.indexCollectionFromType((isUnion) ? graph : graph["type"]);
        const name = this.getType(graph, "name", isUnion);
        return { type, name };
    }

    private addingReferences(fullType: object): void {
        const typeName = fullType["name"];
        const typeType = fullType["type"];
        const savedReference = _.includes(this.allReferences[typeType](), typeName);
        if (typeType == "scalarType") {
            if (!this.isDefaultScalarType(typeName) && !savedReference) {
                this.allReferences[typeType].push(typeName);
            }
        }
        else if (!savedReference) {
            this.allReferences[typeType].push(typeName);
            if (typeType != "enumType") {
                this.referenceQueue.push(fullType);
            }
        }
    }

    private isDefaultScalarType(name: string): boolean {
        return _.includes(GraphqlDefaultScalarTypes, name);
    }

    private convertToList(references: object): object[] {
        return _.flatMap(references, (names, type) => {
            return _.map(names(), (name) => {
                return { 
                    type, 
                    name, 
                    schemaView: ko.observable<string>("table"),
                };
            });
        });
    }

    public anchorLink(graph: object, destination = false): string {
        const url = this.getReferenceUrl(graph["type"] + graph["name"]);
        return (destination) ? url : `#${url}`;
    }

    public prettyType(type: string): string {
        return GraphqlTypesForDocumentation[type];
    }

    public referenceFieldList(reference: object): Array<object> {
        const type = reference["type"];
        const name = reference["name"];
        const graphType = this.graphDocService.docGraphs[type];
        if (graphType) {
            const graph = graphType()[name];
            if (!graph) {
                return [];
            }
            if (type == "inputObjectType" || type == "objectType" || type == "interfaceType") {
                return this.fieldValues(graph[GraphqlFieldTypes.fields]);
            } else if (type == "enumType") {
                return graph[GraphqlFieldTypes.values];
            } else {
                return graph[GraphqlFieldTypes.types];
            }
        }
    }

    private getReferenceUrl(definition: string): string {
        const selected = this.graphSelected();
        return this.graphDocService.routeHelper.getGraphDefinitionReferenceId(this.graphDocService.selectedApiName(), selected[GraphqlCustomFieldNames.type](), selected["name"], definition);
    }

    public switchToTable(schemaView: ko.Observable): void {
        schemaView("table");
    }

    public switchToRaw(schemaView: ko.Observable): void {
        schemaView("raw");
    }

    public content(reference: object, graph = null): string {
        if (!graph) {
            graph = this.graphDocService.docGraphs[reference["type"]]()[reference["name"]];
        }
        const location = graph?.astNode?.loc;
        return location && this.graphDocService.content().substring(location.start, location.end);
    }
}