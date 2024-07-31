import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { HttpClient } from "@paperbits/common/http/httpClient";
import { FluentProvider} from "@fluentui/react-components";
import { TypeOfApi, fuiTheme } from "../../../../../constants";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { GraphqlService } from "../../../../../services/graphqlService";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { OAuthService } from "../../../../../services/oauthService";
import { TenantService } from "../../../../../services/tenantService";
import { GraphDocService } from "../../../operation-details/ko/runtime/graphql-documentation/graphql-doc-service";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { OperationDetailsWebsocket } from "./OperationDetailsWebsocket";
import { OperationDetails } from "./OperationDetails";
import { OperationDetailsGql } from "./OperationDetailsGql";

export interface OperationDetailsRuntimeProps {
    enableConsole?: boolean,
    useCorsProxy?: boolean,
    includeAllHostnames?: boolean,
    enableScrollTo?: boolean,
    showExamples?: boolean,
    defaultSchemaView: string
}

interface OperationDetailsRuntimeState {
    apiName: string,
    apiType: string,
    operationName: string,
    graphName: string,
    graphType: string
}

export class OperationDetailsRuntime extends React.Component<OperationDetailsRuntimeProps, OperationDetailsRuntimeState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("tagService")
    public tagService: TagService;

    @Resolve("graphqlService")
    public graphqlService: GraphqlService;

    @Resolve("graphDocService")
    public graphDocService: GraphDocService;

    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("productService")
    public productService: ProductService;

    @Resolve("oauthService")
    public oauthService: OAuthService;

    @Resolve("tenantService")
    public tenantService: TenantService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router; 

    @Resolve("settingsProvider")
    public settingsProvider: ISettingsProvider;

    @Resolve("sessionManager")
    public sessionManager: SessionManager;

    @Resolve("httpClient")
    public httpClient: HttpClient;

    constructor(props: OperationDetailsRuntimeProps) {
        super(props);

        this.state = {
            apiName: null,
            apiType: null,
            operationName: null,
            graphName: null,
            graphType: null
        }
    }

    componentDidMount(): void {
        this.getApi();
        this.router.addRouteChangeListener(() => this.getApi());
    }

    componentWillUnmount(): void {
        this.router.removeRouteChangeListener(() => this.getApi());
    }

    getApi = async (): Promise<void> => {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();
        const graphName = this.routeHelper.getGraphName();
        const graphType = this.routeHelper.getGraphType();
        let apiType: string;

        if (apiName && (
            apiName !== this.state.apiName
            || operationName !== this.state.operationName
            || graphName !== this.state.graphName
            || graphType !== this.state.graphType
        )) {
            const api = await this.apiService.getApi(`apis/${apiName}`);
            apiType = api?.type;

            this.graphDocService.initialize(); // TODO: remove this when the whole GQL logic is moved to React

            this.setState({ apiName, apiType, operationName, graphName, graphType });
        }
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                {this.state.apiType === TypeOfApi.webSocket 
                    ? <OperationDetailsWebsocket
                            {...this.props}
                            apiName={this.state.apiName}
                            apiService={this.apiService}
                            oauthService={this.oauthService}
                            routeHelper={this.routeHelper}
                        />
                    : this.state.apiType === TypeOfApi.graphQL
                        ? <OperationDetailsGql
                            {...this.props}
                            apiName={this.state.apiName}
                            graphName={this.state.graphName}
                            graphType={this.state.graphType}
                            apiService={this.apiService}
                            graphqlService={this.graphqlService}
                            usersService={this.usersService}
                            productService={this.productService}
                            oauthService={this.oauthService}
                            tenantService={this.tenantService}
                            routeHelper={this.routeHelper}
                            settingsProvider={this.settingsProvider}
                            sessionManager={this.sessionManager}
                            httpClient={this.httpClient}
                          />
                        : <OperationDetails
                            {...this.props}
                            apiName={this.state.apiName}
                            operationName={this.state.operationName}
                            apiService={this.apiService}
                            usersService={this.usersService}
                            productService={this.productService}
                            oauthService={this.oauthService}
                            tenantService={this.tenantService}
                            routeHelper={this.routeHelper}
                            settingsProvider={this.settingsProvider}
                            sessionManager={this.sessionManager}
                            httpClient={this.httpClient}
                        />
                }
            </FluentProvider>
        );
    }
}