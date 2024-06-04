import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Pagination } from "../../../../utils/react/Pagination";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { TableFiltersSidebar } from "../../../../utils/react/TableFilters";
import { useTableFiltersTags } from "../../../../utils/react/useTableFiltersTags";
import { fuiTheme } from "../../../../../constants";
import { ApisTable } from "./ApisTable";
import { ApisCards } from "./ApisCards";
import { TApisData } from "./utils";

export interface ApiListProps {
    productName?: string;
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    filtersInSidebar?: boolean;
    showApiType?: boolean;
    defaultGroupByTagToEnabled?: boolean;
    detailsPageUrl: string;
    detailsPageTarget: string;

    layoutDefault: TLayout | undefined; // TODO remove undefined once finished
}

const loadApis = async (apiService: ApiService, query: SearchQuery, groupByTags?: boolean, productName?: string) => {
    let apis: TApisData;

    try {
        if (productName) {
            apis = await apiService.getProductApis(`products/${productName}`, query);
        } else if (groupByTags) {
            apis = await apiService.getApisByTags(query);
        } else {
            apis = await apiService.getApis(query);
        }
    } catch (error) {
        throw new Error(`Unable to load APIs. Error: ${error.message}`);
    }

    return apis;
}

const ApiListRuntimeFC = ({
    apiService, tagService, getReferenceUrl, productName, layoutDefault, showApiType, allowViewSwitching, filtersInSidebar, detailsPageTarget, defaultGroupByTagToEnabled
}: ApiListProps & { apiService: ApiService, tagService: TagService, getReferenceUrl: (api: Api) => string }) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [apis, setApis] = useState<TApisData>();
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [pattern, setPattern] = useState<string>();
    const [groupByTag, setGroupByTag] = useState(!!defaultGroupByTagToEnabled);
    const [filters, setFilters] = useState({tags: [] as string[]});

    /**
     * Loads page of APIs.
     */
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            tags: !groupByTag ? filters.tags.map(name => ({id: name, name})) : [],
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        setWorking(true);
        loadApis(apiService, query, groupByTag, productName)
            .then(apis => setApis(apis))
            .finally(() => setWorking(false));
    }, [apiService, pageNumber, groupByTag, filters, pattern, productName]);

    const filterOptionTags = useTableFiltersTags(tagService);

    const content = (
        <Stack tokens={{childrenGap: "1rem"}}>
            <Stack.Item>
                <TableListInfo
                    layout={layout}
                    setLayout={setLayout}
                    pattern={pattern}
                    setPattern={setPattern}
                    filters={filters}
                    setFilters={setFilters}
                    filtersOptions={(!filtersInSidebar && !groupByTag) ? [filterOptionTags] : undefined}
                    setGroupByTag={productName ? undefined : setGroupByTag} // don't allow grouping by tags when filtering for product APIs due to missing BE support
                    allowViewSwitching={allowViewSwitching}
                    defaultGroupByTagToEnabled={defaultGroupByTagToEnabled}
                />
            </Stack.Item>

            {working || !apis ? (
                <Stack.Item>
                    <Spinner label="Loading APIs" labelPosition="below" size="extra-large"/>
                </Stack.Item>
            ) : (
                <>
                    <Stack.Item>
                        {layout === TLayout.table ? (
                            <ApisTable apis={apis} showApiType={showApiType} getReferenceUrl={getReferenceUrl}
                                       detailsPageTarget={detailsPageTarget}/>
                        ) : (
                            <ApisCards apis={apis} showApiType={showApiType} getReferenceUrl={getReferenceUrl}
                                       detailsPageTarget={detailsPageTarget}/>
                        )}
                    </Stack.Item>

                    <Stack.Item align={"center"}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber}
                                    pageMax={Math.ceil(apis?.count / Constants.defaultPageSize)}/>
                    </Stack.Item>
                </>
            )}
        </Stack>
    );

    return !filtersInSidebar ? content : (
        <Stack horizontal tokens={{childrenGap: "2rem"}}>
            <Stack.Item shrink={0} style={{ minWidth: "12rem", width: "15%", maxWidth: "20rem" }}>
                <TableFiltersSidebar filtersActive={filters} setFiltersActive={setFilters} filtersOptions={groupByTag ? [] : [filterOptionTags]}/>
            </Stack.Item>
            <Stack.Item style={{width: "100%"}}>
                {content}
            </Stack.Item>
        </Stack>
    );
}

export class ApiListRuntime extends React.Component<ApiListProps> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("tagService")
    public tagService: TagService;

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
              tagService={this.tagService}
              getReferenceUrl={(api) => this.getReferenceUrl(api)}
            />
          </FluentProvider>
        );
    }
}
