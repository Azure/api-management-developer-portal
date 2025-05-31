import * as React from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Api } from "../../../../../models/api";
import * as Constants from "../../../../../constants";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TLayout } from "../../../../utils/react/TableListInfo";
import { FiltersPosition } from "../../listOfApisContract";
import { ApiListTableCards } from "./ApiListTableCards";
import { ApiListDropdown } from "./ApiListDropdown";

export interface ApiListProps {
    productName?: string;
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    filtersPosition?: FiltersPosition;
    showApiType?: boolean;
    defaultGroupByTagToEnabled?: boolean;
    detailsPageUrl: string;
    detailsPageTarget: string;
    layoutDefault: TLayout;
}

interface ApiListState {
    working: boolean;
    api?: Api;
}

export type TApiListRuntimeFCProps = Omit<ApiListProps, "detailsPageUrl"> & {
    apiService: ApiService;
    tagService: TagService;
    getReferenceUrl: (apiName: string) => string;
}

export class ApiListRuntime extends React.Component<ApiListProps, ApiListState> {
    @Resolve("apiService")
    public declare apiService: ApiService;

    @Resolve("tagService")
    public declare tagService: TagService;

    @Resolve("routeHelper")
    public declare routeHelper: RouteHelper;

    constructor(props) {
        super(props);

        this.state = {
            working: false,
            api: undefined,
        };
    }

    public componentDidMount() {
        this.loadSelectedApi();
    }

    async loadSelectedApi() {
        const apiName = this.routeHelper.getApiName();
        if (!apiName) return;

        this.setState({ working: true, api: undefined });

        return this.apiService
            .getApi(`apis/${apiName}`)
            .then((api) => this.setState({ api }))
            .finally(() => this.setState({ working: false }));
    }

    private getReferenceUrl(apiName: string): string {
        return this.routeHelper.getApiReferenceUrl(apiName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                {this.props.layoutDefault == TLayout.dropdown
                    ? <ApiListDropdown
                        {...this.props}
                        selectedApi={this.state.api}
                        apiService={this.apiService}
                        getReferenceUrl={(apiName) => this.getReferenceUrl(apiName)}
                    />
                    : <ApiListTableCards
                        {...this.props}
                        apiService={this.apiService}
                        tagService={this.tagService}
                        getReferenceUrl={(apiName) => this.getReferenceUrl(apiName)}
                    />
                }
            </FluentProvider>
        );
    }
}
