import * as _ from "lodash";
import * as GraphQL from "graphql";
import * as ko from "knockout";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "./apiService";
import { RouteHelper } from "../routing/routeHelper";
import { GraphqlCustomFieldNames, GraphqlTypes, GraphqlTypesForDocumentation, TypeOfApi } from "../constants";

export type TGraphqlTypes = {
    query: object,
    mutation: object,
    subscription: object,
    objectType: object,
    inputObjectType: object,
    enumType: object,
    scalarType: object,
    unionType: object,
    interfaceType: object
}

export class GraphqlService {
    constructor(
        private readonly apiService: ApiService,
        public readonly router: Router,
        public readonly routeHelper: RouteHelper
    ) {}

    public async getGraphqlTypesAndSchema(apiName: string): Promise<{graphqlTypes: TGraphqlTypes, schema: string}> {
        const api = await this.apiService.getApi(`apis/${apiName}`);
        const graphqlTypes: TGraphqlTypes = {
            query: {},
            mutation: {},
            subscription: {},
            objectType: {},
            inputObjectType: {},
            enumType: {},
            scalarType: {},
            unionType: {},
            interfaceType: {}
        };

        if (api?.type === TypeOfApi.graphQL) {
            const graphQLSchema = await this.apiService.getGQLSchema(api.id);
            if (!graphQLSchema) {
                return;
            }
            const schema = graphQLSchema.graphQLSchema;
            const builtSchema = GraphQL.buildSchema(graphQLSchema.graphQLSchema, { commentDescriptions: true });

            graphqlTypes.query = builtSchema.getQueryType()?.getFields();
            graphqlTypes.mutation = builtSchema.getMutationType()?.getFields();
            graphqlTypes.subscription = builtSchema.getSubscriptionType()?.getFields();

            const typeMap = builtSchema.getTypeMap();
            graphqlTypes.objectType = _.pickBy(typeMap, (t) => {
                return (t instanceof GraphQL.GraphQLObjectType);
            });
            graphqlTypes.inputObjectType = _.pickBy(typeMap, (t) => {
                return (t instanceof GraphQL.GraphQLInputObjectType);
            });
            graphqlTypes.enumType = _.pickBy(typeMap, (t) => {
                return (t instanceof GraphQL.GraphQLEnumType);
            });
            graphqlTypes.scalarType = _.pickBy(typeMap, (t) => {
                return (t instanceof GraphQL.GraphQLScalarType);
            });
            graphqlTypes.unionType = _.pickBy(typeMap, (t) => {
                return (t instanceof GraphQL.GraphQLUnionType);
            });
            graphqlTypes.interfaceType = _.pickBy(typeMap, (t) => {
                return (t instanceof GraphQL.GraphQLInterfaceType);
            });

            _.forEach(graphqlTypes, (value, key) => {
                const valueData = value;
                this.addingNewFields(valueData, key);
                if (key == GraphqlTypes.query || key == GraphqlTypes.subscription || key == GraphqlTypes.mutation) {
                    value = this.sortingAlphabetically(valueData);
                }
                graphqlTypes[key] = value;
            });      

            return { graphqlTypes, schema };
        }
    }

    public async getAvailableGraphqlTypes(graphqlTypes: TGraphqlTypes): Promise<string[]> {
        const availableTypes = [];

        _.each(GraphqlTypesForDocumentation, (value, key) => {
            if (_.size(graphqlTypes[key]) > 0 && (key == GraphqlTypes.query || key == GraphqlTypes.subscription || key == GraphqlTypes.mutation)) {
                availableTypes.push(value);
            }
        });

        return availableTypes;
    }

    public sortingAlphabetically(collection: object): object {
        return _(collection).toPairs().sortBy(0).fromPairs().value();
    }

    private addingNewFields(collection: object, type: string) {
        _.forEach(collection, (value) => {
            if (type == GraphqlTypes.query || type == GraphqlTypes.subscription || type == GraphqlTypes.mutation) {
                value[GraphqlCustomFieldNames.selected] = ko.observable<boolean>(false);
            }
            value[GraphqlCustomFieldNames.type] = ko.observable<string>(type);
        });
    }

    public indexCollectionFromType(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType): string {
        while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
            type = type.ofType;
        }
        if (type instanceof GraphQL.GraphQLObjectType) {
            return "objectType";
        }
        if (type instanceof GraphQL.GraphQLInputObjectType) {
            return "inputObjectType";
        }
        if (type instanceof GraphQL.GraphQLEnumType) {
            return "enumType";
        }
        if (type instanceof GraphQL.GraphQLScalarType) {
            return "scalarType";
        }
        if (type instanceof GraphQL.GraphQLUnionType) {
            return "unionType";
        }
        return "interfaceType";
    }
}