import * as GraphQL from "graphql";
import * as ko from "knockout";
import { GraphQLTreeNode, GraphQLOutputTreeNode } from "../graphql-utilities/graphql-node-models";
import { GraphqlOperationTypes } from "../../../../../../constants";


export class GraphDocModel {
    public graphSelected: ko.Observable<GraphQLTreeNode>;

    public docGraphs: {
        query: ko.Observable<GraphQLTreeNode>,
        mutation: ko.Observable<GraphQLTreeNode>,
        subscription: ko.Observable<GraphQLTreeNode>
    }

    constructor(schema: string) {
        this.graphSelected = ko.observable<GraphQLTreeNode>(null);
        this.docGraphs = {
            query: ko.observable<GraphQLTreeNode>(),
            mutation: ko.observable<GraphQLTreeNode>(),
            subscription: ko.observable<GraphQLTreeNode>()
        }
        this.initialize(schema);
    }

    private initialize(content: string): void {
        const schema = GraphQL.buildSchema(content);

        this.docGraphs.query(new GraphQLOutputTreeNode(GraphqlOperationTypes.query, <GraphQL.GraphQLField<any, any>>{
            type: schema.getQueryType(),
            args: []
        }, null, null));
        this.docGraphs.query().toggle(true, false);

        this.docGraphs.mutation(new GraphQLOutputTreeNode(GraphqlOperationTypes.mutation, <GraphQL.GraphQLField<any, any>>{
            type: schema.getMutationType(),
            args: []
        }, null, null));
        this.docGraphs.mutation().toggle(true, false);

        this.docGraphs.subscription(new GraphQLOutputTreeNode(GraphqlOperationTypes.subscription, <GraphQL.GraphQLField<any, any>>{
            type: schema.getSubscriptionType(),
            args: []
        }, null, null));
        this.docGraphs.subscription().toggle(true, false);

        for (const type in GraphqlOperationTypes) {
            if(this.docGraphs[type]().children().length > 0) {
                this.select(this.docGraphs[type]().children()[0]);
                break;
            }
        }
    }

    public select(graph: GraphQLTreeNode) {
        if(this.graphSelected()) {
            this.graphSelected().toggle(false, false);
        }
        this.graphSelected(graph);
        this.graphSelected().toggle(true, false);
    }
}