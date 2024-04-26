import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Body1, FluentProvider} from "@fluentui/react-components";
import { fuiTheme } from "../../../../../constants";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { OperationList } from "./OperationList";

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

export enum TApiType {
    "websocket" = "websocket",
    "graphql" = "graphql"
}

export class OperationListRuntime extends React.Component<OperationListRuntimeProps, OperationListRuntimeState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("tagService")
    public tagService: TagService;

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
        }

        this.setState({ apiName, operationName, apiType });
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                {this.state.apiType === TApiType.websocket 
                    ? <div className={"operation-list-container"}><Body1>WebSocket APIs don't expose API operations.</Body1></div>
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