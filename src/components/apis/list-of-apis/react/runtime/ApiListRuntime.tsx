import * as React from "react";
import { useEffect, useState } from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TLayout } from "../../../../utils/react/TableListInfo";
import { FiltersPosition } from "../../listOfApisContract";
import { TApisData } from "./utils";
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

export type TApiListRuntimeFCProps = Omit<ApiListProps, "detailsPageUrl"> & {
    apiService: ApiService;
    tagService: TagService;
    getReferenceUrl: (apiName: string) => string;
}

const loadApis = async (apiService: ApiService, query: SearchQuery, groupByTag?: boolean, productName?: string) => {
    let apis: TApisData;

    try {
        if (productName) {
            apis = await apiService.getProductApis(`products/${productName}`, query);
        } else if (groupByTag) {
            apis = await apiService.getApisByTags(query);
        } else {
            apis = await apiService.getApis(query);
        }
    } catch (error) {
        throw new Error(`Unable to load APIs. Error: ${error.message}`);
    }

    return apis;
}

const ApiListRuntimeFC = ({ apiService, productName, defaultGroupByTagToEnabled, layoutDefault, ...props }: TApiListRuntimeFCProps) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [apis, setApis] = useState<TApisData>();
    const [pattern, setPattern] = useState<string>();
    const [groupByTag, setGroupByTag] = useState(!!defaultGroupByTagToEnabled);
    const [filters, setFilters] = useState({tags: [] as string[]});

    /**
     * Loads page of APIs.
     */
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            tags: filters.tags.map(name => ({id: name, name})),
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        setWorking(true);
        loadApis(apiService, query, groupByTag, productName)
            .then(apis => setApis(apis))
            .finally(() => setWorking(false));
    }, [apiService, pageNumber, groupByTag, filters, pattern, productName]);

    return layoutDefault == TLayout.dropdown ? (
        <ApiListDropdown
            {...props}
            working={working}
            apis={apis}
            statePageNumber={[pageNumber, setPageNumber]}
            statePattern={[pattern, setPattern]}
            stateGroupByTag={[groupByTag, setGroupByTag]}
        />
    ) : (
        <ApiListTableCards
            {...props}
            layoutDefault={layoutDefault}
            productName={productName}
            working={working}
            apis={apis}
            statePageNumber={[pageNumber, setPageNumber]}
            statePattern={[pattern, setPattern]}
            stateFilters={[filters, setFilters]}
            stateGroupByTag={[groupByTag, setGroupByTag]}
        />
    );
}

export class ApiListRuntime extends React.Component<ApiListProps> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("tagService")
    public tagService: TagService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    private getReferenceUrl(apiName: string): string {
        return this.routeHelper.getApiReferenceUrl(apiName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ApiListRuntimeFC
                    {...this.props}
                    apiService={this.apiService}
                    tagService={this.tagService}
                    getReferenceUrl={(apiName) => this.getReferenceUrl(apiName)}
                />
            </FluentProvider>
        );
    }
}
