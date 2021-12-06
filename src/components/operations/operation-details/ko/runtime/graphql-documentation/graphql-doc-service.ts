import * as GraphQL from "graphql";
import * as ko from "knockout";
import { GraphQLTreeNode, GraphQLOutputTreeNode } from "../graphql-utilities/graphql-node-models";
import { GraphqlTypes } from "../../../../../../constants";
import { Api } from "../../../../../../models/api";
import { ApiService } from "../../../../../../services/apiService";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing";
import * as _ from "lodash";

export class GraphDocService {

    // public selectedGraph: {
    //     graph: ko.Observable<GraphQLTreeNode>,
    //     name: ko.Observable<string>,
    //     description: ko.Observable<string>,
    //     arguments: ko.ObservableArray<GraphQLTreeNode>,
    //     graphType: {
    //         name: ko.Observable<string>,
    //         nameComplement: ko.ObservableArray<string>,
    //         type: ko.Observable<GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType>,
    //         newGraphRef: ko.Observable<GraphQLTreeNode>
    //     },
    //     fields: ko.ObservableArray<GraphQLTreeNode>,
    //     values: ko.ObservableArray<GraphQLTreeNode>,
    // }
    public navigation: ko.ObservableArray<object>;
    public docGraphs: {
        query: ko.Observable<object>,
        mutation: ko.Observable<object>,
        subscription: ko.Observable<object>,
        objectType: ko.Observable<object>,
        inputObjectType: ko.Observable<object>,
        enumType: ko.Observable<object>,
        scalarType: ko.Observable<object>,
        unionType: ko.Observable<object>,
        interfaceType: ko.Observable<object>
    }

    private api: ko.Observable<Api>;
    private selectedApiName: ko.Observable<string>;
    private selectedGraphOperationType: ko.Observable<string>;
    private selectedGraphName: ko.Observable<string>;

    constructor(
        private readonly apiService: ApiService,
        public readonly router: Router,
        public readonly routeHelper: RouteHelper
    ) {
        // this.selectedGraph = {
        //     graph: ko.observable<GraphQLTreeNode>(null),
        //     name: ko.observable<string>(),
        //     description: ko.observable<string>(),
        //     arguments: ko.observableArray<GraphQLTreeNode>(),
        //     graphType: {
        //         name: ko.observable<string>(),
        //         nameComplement: ko.observableArray<string>(),
        //         type: ko.observable<GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType>(),
        //         newGraphRef: ko.observable<GraphQLTreeNode>(null)
        //     },
        //     fields: ko.observableArray<GraphQLTreeNode>(),
        //     values: ko.observableArray<GraphQLTreeNode>()
        // };
        this.navigation = ko.observableArray<object>();
        this.docGraphs = {
            query: ko.observable<object>(),
            mutation: ko.observable<object>(),
            subscription: ko.observable<object>(),
            objectType: ko.observable<object>(),
            inputObjectType: ko.observable<object>(),
            enumType: ko.observable<object>(),
            scalarType: ko.observable<object>(),
            unionType: ko.observable<object>(),
            interfaceType: ko.observable<object>()
        };
        this.api = ko.observable<Api>();
        this.selectedApiName = ko.observable<string>();
    }

    public async initialize(): Promise<void> {
        this.selectedApiName(this.routeHelper.getApiName());
        if (this.selectedApiName()) {
            await this.defaultValues();
            this.router.addRouteChangeListener(this.onRouteChangeGraph.bind(this));
        }
    }

    private async getApi(apiName: string): Promise<void> {
        if (!apiName) {
            return;
        }
        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.api(api)
    }

    private async defaultValues(): Promise<void> {
        await this.getApi(this.selectedApiName());
        const graphQLSchemas = await this.apiService.getSchemas(this.api());
        const content = graphQLSchemas.value.find(s => s.graphQLSchema)?.graphQLSchema;
        const schema = GraphQL.buildSchema(content);

        this.docGraphs.query(schema.getQueryType().getFields());
        this.docGraphs.mutation(schema.getMutationType().getFields());
        this.docGraphs.subscription(schema.getSubscriptionType().getFields());

        const typeMap = schema.getTypeMap();
        this.docGraphs.objectType(_.pickBy(typeMap, (t) => {
            return (t instanceof GraphQL.GraphQLObjectType);
        }));
        this.docGraphs.inputObjectType(_.pickBy(typeMap, (t) => {
            return (t instanceof GraphQL.GraphQLInputObjectType);
        }));
        this.docGraphs.enumType(_.pickBy(typeMap, (t) => {
            return (t instanceof GraphQL.GraphQLEnumType);
        }));
        this.docGraphs.scalarType(_.pickBy(typeMap, (t) => {
            return (t instanceof GraphQL.GraphQLScalarType);
        }));
        this.docGraphs.unionType(_.pickBy(typeMap, (t) => {
            return (t instanceof GraphQL.GraphQLUnionType);
        }));
        this.docGraphs.interfaceType(_.pickBy(typeMap, (t) => {
            return (t instanceof GraphQL.GraphQLInterfaceType);
        }));


        console.log("schema")
        console.log(schema)
        console.log("opertaions")
        console.log(this.docGraphs)

        // this.docGraphs.query(new GraphQLOutputTreeNode(GraphqlOperationTypes.query, <GraphQL.GraphQLField<any, any>>{
        //     type: schema.getQueryType(),
        //     args: []
        // }, null, null));
        // this.docGraphs.query().toggle(true, false);

        // this.docGraphs.mutation(new GraphQLOutputTreeNode(GraphqlOperationTypes.mutation, <GraphQL.GraphQLField<any, any>>{
        //     type: schema.getMutationType(),
        //     args: []
        // }, null, null));
        // this.docGraphs.mutation().toggle(true, false);

        // this.docGraphs.subscription(new GraphQLOutputTreeNode(GraphqlOperationTypes.subscription, <GraphQL.GraphQLField<any, any>>{
        //     type: schema.getSubscriptionType(),
        //     args: []
        // }, null, null));
        // this.docGraphs.subscription().toggle(true, false);

        for (const type in GraphqlTypes) {
            if (_.size(this.docGraphs[type]()) > 0) {
                const selectedCollection = this.docGraphs[type]();
                const selectedGraph = selectedCollection[Object.keys(selectedCollection)[0]];
                this.select(selectedGraph);
                break;
            }
        }
    }

    public select(graph: object, fromExplorer = true) {
        const currentSelected = this.navigation().length - 1;
        if (currentSelected > 0) {
            if (this.navigation()[currentSelected]) {
                delete this.navigation()[currentSelected]['isSelectedForDoc'];
            }
            graph['isSelectedForDoc'] = true;
            if (fromExplorer) {
                this.navigation([graph])
            }
            else {
                this.navigation().push(graph);
            }
            //this.graphValuesFilling()
        }
    }

    public async onRouteChangeGraph(): Promise<void> {
        const apiName = this.routeHelper.getApiName();
        const graphType = this.routeHelper.getGraphType();
        const graphName = this.routeHelper.getGraphName();

        if (!apiName) return;

        if (apiName !== this.selectedApiName()) {
            this.selectedApiName(apiName);
            await this.defaultValues();
        }

        if (!(graphType && graphName)) return;
        else {
            this.select(this.docGraphs[graphType]()[graphName]);
        }
        console.log("this.navigation()")
        console.log(this.navigation())
    }

    // private graphValuesFilling(): void {

    //     //Name
    //     const name = this.selectedGraph.graph()?.data?.name;
    //     this.selectedGraph.name((name) ? name : "No Name");

    //     //Description
    //     const description = this.selectedGraph.graph()?.data?.description;
    //     this.selectedGraph.description((description) ? description : "No Description");

    //     //Type
    //     const graphType = this.selectedGraph.graph()?.data?.type;
    //     this.buildTypeName(graphType);

    //     //Arguments
    //     //const arguments = this.selectedGraph.graph()?.data?.args;

    // }

    // private buildTypeName(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType): void {
    //     let tracking = [], complement = [ "", "" ];
    //     while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
    //         tracking.push(type instanceof GraphQL.GraphQLList);
    //         type = type.ofType;
    //     }
    //     this.selectedGraph.graphType.name(type.name);
    //     tracking.reverse();
    //     tracking.forEach(element => {
    //         if(element) {
    //             complement[0] += '[';
    //             complement[1] += ']'
    //         }
    //         else {
    //             complement[1] += '!'
    //         }
    //     });
    //     this.selectedGraph.graphType.nameComplement(complement);
    // }

    public next(): void {
    }
}