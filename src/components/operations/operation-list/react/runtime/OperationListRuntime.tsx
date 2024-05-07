import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Body1, FluentProvider} from "@fluentui/react-components";
import { TypeOfApi, fuiTheme } from "../../../../../constants";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { GraphqlService } from "../../../../../services/graphqlService";
import { GraphDocService } from "../../../operation-details/ko/runtime/graphql-documentation/graphql-doc-service";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { OperationList } from "./OperationList";
import { OperationListGql } from "./OperationListGql";

export interface OperationListRuntimeProps {
    allowSelection?: boolean,
    wrapText?: boolean,
    showToggleUrlPath?: boolean,
    defaultShowUrlPath?: boolean,
    defaultGroupByTagToEnabled?: boolean,
    defaultAllGroupTagsExpanded?: boolean,
    detailsPageUrl: string
}

interface OperationListRuntimeState {
    apiName: string,
    apiType: string,
    operationName: string
}

export class OperationListRuntime extends React.Component<OperationListRuntimeProps, OperationListRuntimeState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("tagService")
    public tagService: TagService;

    @Resolve("graphqlService")
    public graphqlService: GraphqlService;

    @Resolve("graphDocService")
    public graphDocService: GraphDocService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    constructor(props: OperationListRuntimeProps) {
        super(props);

        this.state = {
            apiName: null,
            apiType: null,
            operationName: null
        }
    }

    componentDidMount(): void {
        this.getApi();
    }

    getApi = async (): Promise<void> => {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();
        let apiType: string;

        if (apiName) {
            const api = await this.apiService.getApi(`apis/${apiName}`);
            apiType = api?.type;

            this.graphDocService.initialize(); // TODO: remove this when the whole GQL logic is moved to React
        }

        this.setState({ apiName, operationName, apiType });
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                {this.state.apiType === TypeOfApi.webSocket 
                    ? <div className={"operation-list-container"}><Body1>WebSocket APIs don't expose API operations.</Body1></div>
                    : this.state.apiType === TypeOfApi.graphQL
                        ? <OperationListGql
                            {...this.props}
                            apiName={this.state.apiName}
                            graphqlService={this.graphqlService}
                            routeHelper={this.routeHelper}
                            router={this.router}
                          />
                        : <OperationList
                            {...this.props}
                            apiName={this.state.apiName}
                            operationName={this.state.operationName}
                            apiService={this.apiService}
                            tagService={this.tagService}
                            routeHelper={this.routeHelper}
                            router={this.router}
                        />
                }
            </FluentProvider>
        );
    }
}