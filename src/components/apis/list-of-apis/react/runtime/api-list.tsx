import * as React from "react";
import {
    FluentProvider,
    webLightTheme,
    Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow
} from "@fluentui/react-components";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { Tag } from "../../../../../models/tag";
import { Resolve } from "@paperbits/react/decorators";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";

const columns = [
    {columnKey: "name", label: "Name"},
    {columnKey: "description", label: "Description"},
    {columnKey: "type", label: "Type"},
]

const apis = [{id: 123, label: "Echo", description: "Foo"} as const]

export interface ApiListProps {
    allowSelection?: boolean;
    showApiType?: boolean;
    defaultGroupByTagToEnabled?: boolean;
    detailsPageUrl: string;
}

const ApiListRuntimeFC = (props: ApiListProps) => {
    console.log({props})

    return (
        <FluentProvider theme={webLightTheme}>
            <div className={"fui-table"}>
                <Table size={"small"} aria-label={"APIs List table"}>
                    <TableHeader>
                        <TableRow>
                            {columns.map(column => (
                                <TableHeaderCell key={column.columnKey}>
                                    <b>{column.label}</b>
                                </TableHeaderCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apis.map(api => (
                            <TableRow key={api.id}>
                                <TableCell>
                                    <a href={"detail/" + api.id + window.location.search}>
                                        {api.label}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <TableCellLayout truncate title={api.description}>
                                        {api.description}
                                    </TableCellLayout>
                                </TableCell>
                                <TableCell>TODO</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </FluentProvider>
    );
}

type ApiListState = {
    pageNumber: number,
    working: boolean,
    apis: any[],
    tags: Tag[],
    nextPage?: boolean,
}

export class ApiListRuntime extends React.Component<ApiListProps, ApiListState> {
    @Resolve('apiService')
    public apiService: ApiService;

    @Resolve('routeHelper')
    public routeHelper: RouteHelper;

    public readonly state: ApiListState

    constructor(props: ApiListProps) {
        super(props);

        this.state = {
            pageNumber: 1,
            working: false,
            apis: [],
            tags: [],
        };

        this.loadPageOfApis()
    }

    /**
     * Loads page of APIs.
     */
    public async loadPageOfApis(pattern?: string): Promise<void> {
        const pageNumber = this.state.pageNumber - 1;

        const query: SearchQuery = {
            pattern,
            tags: this.state.tags,
            skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        try {
            this.setState({...this.state, working: true});

            let nextLink: string | null;
/*
            if (this.groupByTag()) {
                const pageOfTagResources = await this.apiService.getApisByTags(query);
                const apiGroups = pageOfTagResources.value;

                this.apiGroups(apiGroups);
                nextLink = pageOfTagResources.nextLink;
            } else {*/
                const pageOfApis = await this.apiService.getApis(query);
                const apis = pageOfApis ? pageOfApis.value : [];

                this.setState({...this.state, apis});
                nextLink = pageOfApis.nextLink;
            //}

            this.setState({ ...this.state, nextPage: !!nextLink });
        }
        catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
        finally {
            this.setState({ ...this.state, working: false });
        }
    }

    public getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.props.detailsPageUrl);
    }

    public async resetSearch(): Promise<void> {
        this.setState({...this.state, pageNumber: 1});
        return this.loadPageOfApis();
    }
/*
    public groupTagCollapseToggle(tag: string): void {
        const newSet = this.groupTagsExpanded();
        newSet.has(tag) ? newSet.delete(tag) : newSet.add(tag);
        this.groupTagsExpanded(newSet);
    }
*/
    public async onTagsChange(tags: Tag[]): Promise<void> {
        this.setState({...this.state, tags});
    }

    render() {
        return <ApiListRuntimeFC {...this.props} />
    }
}
