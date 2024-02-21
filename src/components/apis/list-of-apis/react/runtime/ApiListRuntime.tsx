import * as React from "react";
import { useEffect, useState } from "react";
import {
    FluentProvider,
    Table,
    TableBody,
    TableCell,
    TableCellLayout,
    TableHeader,
    TableHeaderCell,
    TableRow,
    webLightTheme,
    Spinner,
} from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { Tag } from "../../../../../models/tag";
import { Page } from "../../../../../models/page";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Pagination } from "./Pagination";
import { ApisTableInfo } from "./ApisTableInfo";
// import { fuiTheme } from "../../../../../constants/fuiTheme";

export interface ApiListProps {
    allowSelection?: boolean;
    showApiType?: boolean;
    defaultGroupByTagToEnabled?: boolean;
    detailsPageUrl: string;
}

const loadData = async (apiService: ApiService, query: SearchQuery) => {
    let apis: Page<Api>
    try {
        /*
        if (this.groupByTag()) {
            const pageOfTagResources = await this.apiService.getApisByTags(query);
            const apiGroups = pageOfTagResources.value;

            this.apiGroups(apiGroups);
            nextLink = pageOfTagResources.nextLink;
        } else {*/
            apis = await apiService.getApis(query);
        //}
    } catch (error) {
        throw new Error(`Unable to load APIs. Error: ${error.message}`);
    }

    return apis
}

const ApiListRuntimeFC = ({apiService, getReferenceUrl, ...props}: ApiListProps & { apiService: ApiService, getReferenceUrl: (api: Api) => string }) => {
    const [working, setWorking] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [pattern, setPattern] = useState<string>()
    const [tags, setTags] = useState(new Set<Tag>())
    const [apis, setApis] = useState<Page<Api>>()
    const [nextPage, setNextPage] = useState(false)

    /**
     * Loads page of APIs.
     */
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            tags: [...tags],
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        setWorking(true)
        loadData(apiService, query)
            .then(apis => setApis(apis))
            .finally(() => setWorking(false))
    }, [apiService, pageNumber, tags, pattern])

    if (working) {
        return (
            <div className="table-body">
                <Spinner label="Loading APIs" labelPosition="below" size="extra-large" />
            </div>
        )
    }

    const pageMax = Math.ceil(apis?.count / Constants.defaultPageSize)

    return (
        <>
            <ApisTableInfo apis={apis} pageNumber={pageNumber} />

            <div className={"fui-table"}>
                <Table size={"small"} aria-label={"APIs List table"}>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>
                                <b>Name</b>
                            </TableHeaderCell>
                            <TableHeaderCell>
                                <b>Description</b>
                            </TableHeaderCell>
                            {props.showApiType && (
                                <TableHeaderCell style={{width: "8em"}}>
                                    <b>Type</b>
                                </TableHeaderCell>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apis?.value?.map(api => (
                            <TableRow key={api.id}>
                                <TableCell>
                                    <a href={getReferenceUrl(api)} title={api.displayName}>
                                        {api.displayName}
                                        {!!api.apiVersion && (" - " + api.apiVersion)}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <TableCellLayout truncate title={api.description}>
                                        {api.description}
                                    </TableCellLayout>
                                </TableCell>
                                {props.showApiType && (
                                    <TableCell>{api.typeName}</TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div style={{marginTop: "3rem", textAlign: "center"}}>
                <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={pageMax} />
            </div>
        </>
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
  @Resolve("apiService")
  public apiService: ApiService;

  @Resolve("routeHelper")
  public routeHelper: RouteHelper;

  public readonly state: ApiListState;

  constructor(props: ApiListProps) {
    super(props);

    this.state = {
      pageNumber: 1,
      working: false,
      apis: [],
      tags: [],
    };
  }

  public componentWillReceiveProps(
    nextProps: Readonly<ApiListProps>,
    nextContext: any
  ) {
      console.log("componentWillReceiveProps", { nextProps });
  }

  public componentDidUpdate(
    prevProps: Readonly<ApiListProps>,
    prevState: Readonly<ApiListState>,
    snapshot?: any
  ) {
    console.log("componentDidUpdate", this.props, prevProps);
  }

  private getReferenceUrl(api: Api): string {
    return this.routeHelper.getApiReferenceUrl(api.name, this.props.detailsPageUrl);
  }

  /*
    public groupTagCollapseToggle(tag: string): void {
        const newSet = this.groupTagsExpanded();
        newSet.has(tag) ? newSet.delete(tag) : newSet.add(tag);
        this.groupTagsExpanded(newSet);
    }
*/
  render() {
    return (
      <FluentProvider theme={webLightTheme /*fuiTheme*/}>
        <ApiListRuntimeFC
          {...this.props}
          apiService={this.apiService}
          getReferenceUrl={(api) => this.getReferenceUrl(api)}
        />
      </FluentProvider>
    );
  }
}
