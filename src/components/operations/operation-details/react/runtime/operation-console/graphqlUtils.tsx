import * as GraphQL from "graphql";
import { GraphqlTypes } from "../../../../../../constants";
import { GraphQLInputTreeNode, GraphQLOutputTreeNode, GraphQLTreeNode, getType } from "../../../ko/runtime/graphql-utilities/graphql-node-models";

export type OperationNodes = {
    query: GraphQLTreeNode,
    mutation: GraphQLTreeNode,
    subscription: GraphQLTreeNode
}

export const loadGQLSchema = async (api, apiService, graphqlService, generateDocument) => {
    let operationNodes: OperationNodes = { query: null, mutation: null, subscription: null };
    let globalNodes: GraphQLTreeNode[] = [];
    const graphQLSchema = await apiService.getGQLSchema(api.id);
    console.log("graphQLSchema: ", graphQLSchema.graphQLSchema);

    if (graphQLSchema?.graphQLSchema) {
        const schema = GraphQL.buildSchema(graphQLSchema.graphQLSchema);
        console.log("schema: ", schema);
        const operationNodes = {
            query: new GraphQLOutputTreeNode(GraphqlTypes.query, { type: schema.getQueryType(), args: [] } as GraphQL.GraphQLField<any, any>, generateDocument, null);
            mutation: new GraphQLOutputTreeNode(GraphqlTypes.mutation, { type: schema.getMutationType(), args: [] } as GraphQL.GraphQLField<any, any>, generateDocument, null);
            subscription: new GraphQLOutputTreeNode(GraphqlTypes.subscription, { type: schema.getSubscriptionType(), args: [] } as GraphQL.GraphQLField<any, any>, generateDocument, null);    
        }

        const graphqlTypes = (await graphqlService.getGraphqlTypesAndSchema(api.name))?.graphqlTypes;
        const availableGraphqlTypes = await graphqlService.getAvailableGraphqlTypes(graphqlTypes);

        console.log('availableGraphqlTypes', availableGraphqlTypes);

        if (availableGraphqlTypes) {
            globalNodes = availableGraphqlTypes.map(type => {
                console.log('type', type.toLowerCase());
                const node = operationNodes[type.toLowerCase()];
                return node.toggle(true);
            })
        }
    }

    console.log('gl', globalNodes);

    return { operationNodes, globalNodes };
}

 /**
     * @param nodes list of root nodes to generate from
     * @param level level for indent
     * @returns string of generated node, for example:
     * {
     *    dragon
     * }
     */
 export const createFieldStringFromNodes = (nodes: GraphQLTreeNode[], level: number): string => {
    let selectedNodes: string[] = [];
    for (const node of nodes) {
        const inputNodes: GraphQLInputTreeNode[] = [];
        const outputNodes: GraphQLTreeNode[] = [];
        for (const child of node.children()) {
            if (child instanceof GraphQLInputTreeNode) {
                inputNodes.push(child);
            } else {
                outputNodes.push(child);
            }
        }
        const isOperation = node.label() === GraphqlTypes.query || node.label() === GraphqlTypes.mutation || node.label() === GraphqlTypes.subscription;
        if ((node.selected() && !isOperation) || (node.selected() && isOperation && node.hasActiveChild())) {
            const parentType = getType(node.parent()?.data?.type);
            const nodeName = (parentType instanceof GraphQL.GraphQLUnionType) ? `... on ${node.label()}` : node.label();
            if (level === 0) {
                selectedNodes.push(nodeName + createVariableString(node as GraphQLOutputTreeNode) + createFieldStringFromNodes(outputNodes, level + 1));
            } else {
                selectedNodes.push(nodeName + createArgumentStringFromNode(inputNodes, true) + createFieldStringFromNodes(outputNodes, level + 1));
            }
        }
    }
    selectedNodes = selectedNodes.map(node => "\t".repeat(level) + node);
    let result: string;
    if (selectedNodes.length === 0) {
        result = "";
    } else {
        if (level === 0) {
            result = selectedNodes.join("\n\n");
        } else {
            result = ` {\n${selectedNodes.join("\n")}\n${"\t".repeat(level - 1)}}`;
        }
    }
    return result;
}

/**
*
* @param node root node, either query, mutation, or subscription
* @returns list of variable as string to parse in document. For example, ($lim: Int!)
*/
export const createVariableString = (node: GraphQLOutputTreeNode): string => {
    if (node.variables.length > 0) {
        return "(" + node.variables.map(v => `$${v.name}: ${v.type}`).join(", ") + ")";
    }
    return "";
}

/**
 * Example: (limit: 10)
 * @param nodes list of root nodes to generate from
 * @param firstLevel true if this is the first level of object argument ({a: {b: 2}})
 * @returns string of argument of the declaration. For example, (a : 1)
 */
export const createArgumentStringFromNode = (nodes: GraphQLInputTreeNode[], firstLevel: boolean): string => {
    const selectedNodes: string[] = [];
    for (const node of nodes) {
        if (node.selected()) {
            const type = getType(node.data.type);
            if (node.isScalarType() || node.isEnumType()) {
                selectedNodes.push(`${node.label()}: ${node.inputValue()}`);
            } else if (type instanceof GraphQL.GraphQLInputObjectType) {
                selectedNodes.push(`${node.label()}: { ${createArgumentStringFromNode(node.children(), false)} }`);
            }
        }
    }
    return selectedNodes.length > 0 ? (firstLevel ? `(${selectedNodes.join(", ")})` : selectedNodes.join(", ")) : "";
}