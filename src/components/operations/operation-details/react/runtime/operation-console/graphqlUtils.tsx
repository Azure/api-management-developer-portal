import * as GraphQL from "graphql";
import { Api } from "../../../../../../models/api";
import { ApiService } from "../../../../../../services/apiService";
import { GraphqlService } from "../../../../../../services/graphqlService";
import { GraphqlMetaField, GraphqlTypes } from "../../../../../../constants";
import { GraphQLInputTreeNode, GraphQLOutputTreeNode, GraphQLTreeNode, getType } from "./graphql-utilities/graphql-node-models";

export type OperationNodes = {
    query: GraphQLTreeNode,
    mutation: GraphQLTreeNode,
    subscription: GraphQLTreeNode
}

export const loadGQLSchema = async (
    api: Api,
    selectedGraphType: string,
    selectedGraphName: string,
    apiService: ApiService,
    graphqlService: GraphqlService,
    generateDocument
) => {
    let operationNodes: OperationNodes = { query: null, mutation: null, subscription: null };
    let globalNodes: GraphQLTreeNode[] = [];
    let availableGraphqlTypes: string[] = [];
    const graphQLSchema = await apiService.getGQLSchema(api.id);
    const schema = graphQLSchema?.graphQLSchema;

    if (schema) {
        const schema = GraphQL.buildSchema(graphQLSchema.graphQLSchema);
        const operationNodes = {
            query: new GraphQLOutputTreeNode(
                GraphqlTypes.query,
                { type: schema.getQueryType(), args: [] } as GraphQL.GraphQLField<any, any>,
                () => generateDocument(globalNodes),
                null
            ),
            mutation: new GraphQLOutputTreeNode(
                GraphqlTypes.mutation,
                { type: schema.getMutationType(), args: [] } as GraphQL.GraphQLField<any, any>,
                () => generateDocument(globalNodes),
                null
            ),
            subscription: new GraphQLOutputTreeNode(
                GraphqlTypes.subscription,
                { type: schema.getSubscriptionType(), args: [] } as GraphQL.GraphQLField<any, any>,
                () => generateDocument(globalNodes),
                null
            )
        }

        const graphqlTypes = (await graphqlService.getGraphqlTypesAndSchema(api.name))?.graphqlTypes;
        availableGraphqlTypes = await graphqlService.getAvailableGraphqlTypes(graphqlTypes);

        if (availableGraphqlTypes) {
            globalNodes = availableGraphqlTypes.map(type => {
                const node = operationNodes[type.toLowerCase()];
                node.toggle(true);
                
                if (type.toLowerCase() === selectedGraphType) {
                    node.children().forEach(child => {
                        if (child.label() === selectedGraphName) {
                            child.toggle(true);
                        }
                    });
                }

                return node;
            })
        }
    }

    return { operationNodes, globalNodes, schema, availableGraphqlTypes };
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

export const documentToTree = (document: string, globalNodes) => {
    try {
        const ast = GraphQL.parse(document, { noLocation: true });
        for (const node of globalNodes) {
            node?.clear();
            node?.toggle(true, false);
        }
        let curNode: GraphQLTreeNode;
        let variables = [];

        // Go through every node in a new generated parsed graphQL, associate the node with the created tree from init and toggle checkmark.
        GraphQL.visit(ast, {
            enter: node => {
                if (node.kind === GraphQL.Kind.OPERATION_DEFINITION) {
                    variables = [];
                    curNode = globalNodes.find(mainNode => mainNode.label() == node.operation);
                } else if (node.kind === GraphQL.Kind.FIELD || node.kind === GraphQL.Kind.ARGUMENT
                    || node.kind === GraphQL.Kind.OBJECT_FIELD || node.kind === GraphQL.Kind.INLINE_FRAGMENT) {
                    let targetNode: GraphQLTreeNode;
                    if (node.kind === GraphQL.Kind.FIELD) {
                        targetNode = curNode.children().find(n => !n.isInputNode() && n.label() === node.name.value);
                    } else if (node.kind === GraphQL.Kind.INLINE_FRAGMENT) {
                        targetNode = curNode.children().find(n => !n.isInputNode() && n.label() === node.typeCondition.name.value);
                    } else {
                        const inputNode = (curNode as GraphQLInputTreeNode).children().find(n => n.isInputNode() && n.label() === node.name.value);
                        if (node.value.kind === GraphQL.Kind.STRING) {
                            inputNode.inputValue(`"${node.value.value}"`);
                        } else if (node.value.kind === GraphQL.Kind.BOOLEAN || node.value.kind === GraphQL.Kind.INT
                            || node.value.kind === GraphQL.Kind.FLOAT || node.value.kind === GraphQL.Kind.ENUM) {
                            inputNode.inputValue(`${node.value.value}`);
                        } else if (node.value.kind === GraphQL.Kind.VARIABLE) {
                            inputNode.inputValue(`$${node.value.name.value}`);
                        }
                        targetNode = inputNode;
                    }
                    if (targetNode) {
                        curNode = targetNode;
                        curNode.toggle(true, false);
                    }
                } else if (node.kind === GraphQL.Kind.VARIABLE_DEFINITION &&
                    (node.type.kind === GraphQL.Kind.NAMED_TYPE || node.type.kind === GraphQL.Kind.NON_NULL_TYPE)) {
                    let typeString;
                    if (node.type.kind === GraphQL.Kind.NON_NULL_TYPE && node.type.type.kind === GraphQL.Kind.NAMED_TYPE) {
                        typeString = `${node.type.type.name.value}!`;
                    } else if (node.type.kind === GraphQL.Kind.NAMED_TYPE) {
                        typeString = node.type.name.value;
                    }
                    variables.push({
                        name: node.variable.name.value,
                        type: typeString
                    });
                }
            },
            leave: node => {
                if (curNode && (node.kind === GraphQL.Kind.FIELD || node.kind === GraphQL.Kind.ARGUMENT
                    || node.kind === GraphQL.Kind.OBJECT_FIELD || node.kind === GraphQL.Kind.INLINE_FRAGMENT
                    || node.kind === GraphQL.Kind.OPERATION_DEFINITION)) {
                    if (node.kind === GraphQL.Kind.OPERATION_DEFINITION) {
                        (curNode as GraphQLOutputTreeNode).variables = variables;
                    }
                    if (!(node.kind === GraphQL.Kind.FIELD && node.name.value === GraphqlMetaField.typename)) {
                        curNode = curNode.parent();
                    }
                }
            }
        });

        return globalNodes;
    } catch (err) {
        // Do nothing here as the doc is invalidated
        return;
    }
}
