import * as React from "react";
import { useEffect, useState } from "react";
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
    productName?: string;
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    showApiType?: boolean;
    defaultGroupByTagToEnabled?: boolean;
    detailsPageUrl: string;
    detailsPageTarget: string;

    layoutDefault: TLayout | undefined; // TODO remove undefined once finished
}

const loadData = async (apiService: ApiService, query: SearchQuery, groupByTags?: boolean, productName?: string) => {
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
    apiService, getReferenceUrl, productName, layoutDefault, showApiType, allowViewSwitching, detailsPageTarget, defaultGroupByTagToEnabled
}: ApiListProps & { apiService: ApiService, getReferenceUrl: (api: Api) => string }) => {
    const [working, setWorking] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [apis, setApis] = useState<TApisData>()
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table)
    const [pattern, setPattern] = useState<string>()
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
        loadData(apiService, query, defaultGroupByTagToEnabled, productName) // TODO defaultGroupByTagToEnabled replace with actual value
            .then(apis => setApis(apis))
            .finally(() => setWorking(false))
    }, [apiService, pageNumber, pattern, productName])

    return (
        <>
            <TableListInfo
                layout={layout}
                setLayout={setLayout}
                pattern={pattern}
                setPattern={setPattern}
                allowViewSwitching={allowViewSwitching}
            />

            {working || !apis ? (
                <div className={"table-body"}>
                    <Spinner label="Loading APIs" labelPosition="below" size="extra-large" />
                </div>
            ) : (
                <>
                    {layout === TLayout.table ? (
                        <ApisTable apis={apis} showApiType={showApiType} getReferenceUrl={getReferenceUrl} detailsPageTarget={detailsPageTarget} />
                    ) : (
                        <ApisCards apis={apis} showApiType={showApiType} getReferenceUrl={getReferenceUrl} detailsPageTarget={detailsPageTarget} />
                    )}

                    <div className={"fui-pagination-container"}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(apis?.count / Constants.defaultPageSize)} />
                    </div>
                </>
            )}
        </>
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
