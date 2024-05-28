import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Pagination } from "../../../../utils/react/Pagination";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { fuiTheme } from "../../../../../constants";
import { ApisTable } from "./ApisTable";
import { ApisCards } from "./ApisCards";
import { TApisData } from "./utils";

export interface ApiListProps {
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    showApiType?: boolean;
    defaultGroupByTagToEnabled?: boolean;
    detailsPageUrl: string;

    layoutDefault: TLayout | undefined; // TODO remove undefined once finished
}

const loadApis = async (apiService: ApiService, query: SearchQuery, groupByTags?: boolean) => {
    let apis: TApisData;

    try {
        apis = await (groupByTags ? apiService.getApisByTags(query) : apiService.getApis(query));
    } catch (error) {
        throw new Error(`Unable to load APIs. Error: ${error.message}`);
    }

    return apis;
}

const ApiListRuntimeFC = ({
    apiService, getReferenceUrl, layoutDefault, showApiType, allowViewSwitching, defaultGroupByTagToEnabled
}: ApiListProps & { apiService: ApiService, getReferenceUrl: (api: Api) => string }) => {
    const [working, setWorking] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [apis, setApis] = useState<TApisData>()
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table)
    const [pattern, setPattern] = useState<string>()
    const [groupByTag, setGroupByTag] = useState(!!defaultGroupByTagToEnabled)
    // const [tags, setTags] = useState(new Set<Tag>())

    /**
     * Loads page of APIs.
     */
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            // tags: [...tags], // TODO filter by tags
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        setWorking(true)
        loadApis(apiService, query, groupByTag)
            .then(apis => setApis(apis))
            .finally(() => setWorking(false))
    }, [apiService, pageNumber, groupByTag, pattern])

    return (
        <Stack tokens={{childrenGap: "1rem"}}>
            <Stack.Item>
                <TableListInfo
                    layout={layout}
                    setLayout={setLayout}
                    pattern={pattern}
                    setPattern={setPattern}
                    setGroupByTag={setGroupByTag} // don't allow grouping by tags when filtering for product APIs
                    allowViewSwitching={allowViewSwitching}
                    defaultGroupByTagToEnabled={defaultGroupByTagToEnabled}
                />
            </Stack.Item>

            {working || !apis ? (
                <Stack.Item>
                    <div className={"table-body"}>
                        <Spinner label="Loading APIs" labelPosition="below" size="extra-large" />
                    </div>
                </Stack.Item>
            ) : (
                <>
                    <Stack.Item>
                        {layout === TLayout.table ? (
                            <ApisTable apis={apis} showApiType={showApiType} getReferenceUrl={getReferenceUrl} />
                        ) : (
                            <ApisCards apis={apis} showApiType={showApiType} getReferenceUrl={getReferenceUrl} />
                        )}
                    </Stack.Item>

                    <Stack.Item align={"center"}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(apis?.count / Constants.defaultPageSize)} />
                    </Stack.Item>
                </>
            )}
        </Stack>
    );
}

export class ApiListRuntime extends React.Component<ApiListProps> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    private getReferenceUrl(api: Api): string {
        return this.routeHelper.getApiReferenceUrl(api.name, this.props.detailsPageUrl);
    }

    render() {
        return (
          <FluentProvider theme={fuiTheme}>
            <ApiListRuntimeFC
              {...this.props}
              apiService={this.apiService}
              getReferenceUrl={(api) => this.getReferenceUrl(api)}
            />
          </FluentProvider>
        );
    }
}
