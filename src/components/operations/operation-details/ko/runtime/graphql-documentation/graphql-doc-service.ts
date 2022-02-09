import * as GraphQL from "graphql";
import * as ko from "knockout";
import { GraphqlTypesForDocumentation, TypeOfApi, GraphqlTypes, GraphqlCustomFieldNames } from "../../../../../../constants";
import { Api } from "../../../../../../models/api";
import { ApiService } from "../../../../../../services/apiService";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing";
import * as _ from "lodash";

export class GraphDocService {
    public currentSelected: ko.Observable<object>;
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
    };
    public content: ko.Observable<string>;

    public api: ko.Observable<Api>;
    public selectedApiName: ko.Observable<string>;
    public readonly availableTypes: ko.ObservableArray<string>;
    public readonly typeIndexer: ko.Observable<object>;

    constructor(
        private readonly apiService: ApiService,
        public readonly router: Router,
        public readonly routeHelper: RouteHelper
    ) {
        this.currentSelected = ko.observable<object>(null);
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
        this.typeIndexer = ko.observable();
        this.availableTypes = ko.observableArray<string>();
        this.content = ko.observable<string>();
    }

    public async initialize(): Promise<void> {
        this.selectedApiName(this.routeHelper.getApiName());
        if (this.selectedApiName()) {
            await this.defaultValues();
            this.router.addRouteChangeListener(this.onRouteChangeGraph.bind(this));
        }
    }

    private async getApi(apiName: string): Promise<void> {
        const api = await this.apiService.getApi(`apis/${apiName}`);
        this.api(api)
    }

    private async defaultValues(): Promise<void> {
        await this.getApi(this.selectedApiName());
        if (this.api().type === TypeOfApi.graphQL) {
            const graphQLSchemas = await this.apiService.getSchemas(this.api());
            this.content(graphQLSchemas.value.find(s => s.graphQLSchema)?.graphQLSchema);
            const schema = GraphQL.buildSchema(this.content(), { commentDescriptions: true });

            this.docGraphs.query(schema.getQueryType()?.getFields());
            this.docGraphs.mutation(schema.getMutationType()?.getFields());
            this.docGraphs.subscription(schema.getSubscriptionType()?.getFields());

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

            _.forEach(this.docGraphs, (value, key) => {
                this.addingNewFields(value(), key);
                if (key == GraphqlTypes.query || key == GraphqlTypes.subscription || key == GraphqlTypes.mutation) {
                    value(this.sortingAlphabetically(value()));
                }
            })

            for (const type in GraphqlTypesForDocumentation) {
                if (_.size(this.docGraphs[type]()) > 0) {
                    const selectedCollection = this.docGraphs[type]();
                    const selectedGraph = selectedCollection[Object.keys(selectedCollection)[0]];
                    this.select(selectedGraph);
                    break;
                }
            }            

            this.getAvailableTypes();
        }
    }

    public select(graph: object): void {
        if (this.currentSelected()) {
            this.currentSelected()[GraphqlCustomFieldNames.selected](false);
        }
        graph[GraphqlCustomFieldNames.selected](true);
        this.currentSelected(graph);
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
    }

    private sortingAlphabetically(collection) {
        return _(collection).toPairs().sortBy(0).fromPairs().value();
    }

    private addingNewFields(collection: object, type: string) {
        _.forEach(collection, (value) => {
            if (type == GraphqlTypes.query || type == GraphqlTypes.subscription || type == GraphqlTypes.mutation) {
                value[GraphqlCustomFieldNames.selected] = ko.observable<boolean>(false);
            }
            value[GraphqlCustomFieldNames.type] = ko.observable<string>(type);
        })
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

    private getAvailableTypes() {
        let indexer = {};
        let availableTypes = [];

        _.each(GraphqlTypesForDocumentation, (v, k) => {
            if (_.size(this.docGraphs[k]()) > 0 && (k == GraphqlTypes.query || k == GraphqlTypes.subscription || k == GraphqlTypes.mutation)) {
                indexer[v] = k;
                availableTypes.push(v);
            }
        })

        this.typeIndexer(indexer);
        this.availableTypes(availableTypes);
    }
}