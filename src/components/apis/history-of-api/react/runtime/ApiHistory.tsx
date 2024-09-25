import * as React from "react";
import { useEffect, useState } from "react";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, FluentProvider, Link, Spinner, Subtitle1, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { Page } from "../../../../../models/page";
import { ChangeLogContract } from "../../../../../contracts/apiChangeLog";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Pagination } from "../../../../utils/react/Pagination";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import { defaultPageSize, fuiTheme } from "../../../../../constants";
import { Utils } from "../../../../../utils";

interface ApiHistoryProps {
    detailsPageUrl?: string
}

interface ApiHistoryState {
    apiName: string
}

const ApiHistoryFC = ({
    apiName,
    apiService,
    routeHelper,
    detailsPageUrl
}: ApiHistoryProps & { apiName: string, apiService: ApiService, routeHelper: RouteHelper }) => {
    const [working, setWorking] = useState<boolean>(false);
    const [api, setApi] = useState<Api>();
    const [currentChangelogPage, setCurrentChangelogPage] = useState<Page<ChangeLogContract>>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    useEffect(() => {
        if (apiName) {
            setWorking(true);
            loadApi().then(api => {
                setApi(api);
                loadChangelogPage(api.id).then(changelogPage => setCurrentChangelogPage(changelogPage));
            }).finally(() => setWorking(false));
        }
    }, [apiName, apiService]);

    useEffect(() => {
        if (api) {
            setWorking(true);
            loadChangelogPage(api.id)
                .then(changelogPage => setCurrentChangelogPage(changelogPage))
                .finally(() => setWorking(false));
        }
    }, [pageNumber]);

    const loadApi = async (): Promise<Api> => {
        let api: Api;
    
        try {
            api = await apiService.getApi(`apis/${apiName}`);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }
    
        return api;
    }

    const loadChangelogPage = async (apiId?: string): Promise<Page<ChangeLogContract>> => {
        let changelogPage: Page<ChangeLogContract>;

        try {
            changelogPage = await apiService.getApiChangeLog(apiId ?? api.id, (pageNumber - 1) * defaultPageSize);
        } catch (error) {
            throw new Error(`Unable to load the API history. Error: ${error.message}`);
        }

        return changelogPage;
    }

    return (
        <>
            {working
                ? <Spinner />
                : api
                    ? <>
                        <Stack horizontal horizontalAlign="space-between" verticalAlign="center" style={{ marginBottom: "2rem" }}>
                            <Stack horizontal verticalAlign="center">
                                <Subtitle1 className={"api-title"}>{api.displayName}</Subtitle1>
                            </Stack>
                            {detailsPageUrl && 
                                <Link href={routeHelper.getApiReferenceUrl(apiName, detailsPageUrl)}>Go back to the API reference page</Link>
                            }
                        </Stack>
                        <Table className={"fui-table"}>
                            <TableHeader>
                                <TableRow className={"fui-table-headerRow"}>
                                    <TableHeaderCell><Body1Strong>Release date</Body1Strong></TableHeaderCell>
                                    <TableHeaderCell><Body1Strong>Notes</Body1Strong></TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentChangelogPage?.value?.length > 0
                                    ? currentChangelogPage.value.map((changelog, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{Utils.formatDateTime(changelog.properties.createdDateTime)}</TableCell>
                                            <TableCell>{changelog.properties.notes}</TableCell>
                                        </TableRow>
                                    ))
                                    : <NoRecordsRow colspan={2} />
                                }                              
                            </TableBody>
                        </Table>
                        {currentChangelogPage?.count > 1 &&
                            <div className={"pagination-container"}>
                                <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(currentChangelogPage?.count / defaultPageSize)} />
                            </div>
                        }
                      </>
                    : <Body1>No API found.</Body1>
            }

        </>
    );
}

export class ApiHistory extends React.Component<ApiHistoryProps, ApiHistoryState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;
    
    @Resolve("router")
    public router: Router;

    constructor(props: ApiHistoryProps) {
        super(props);

        this.state = {
            apiName: null
        }
    }

    componentDidMount(): void {
        this.getApi();
        this.router.addRouteChangeListener(() => this.getApi());
    }

    componentWillUnmount(): void {
        this.router.removeRouteChangeListener(() => this.getApi());
    }

    getApi = (): void => {
        const apiName = this.routeHelper.getApiName();

        if (apiName && apiName !== this.state.apiName) {
            this.setState({ apiName });
        }
    }


    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ApiHistoryFC
                    {...this.props}
                    apiName={this.state.apiName}
                    apiService={this.apiService}
                    routeHelper={this.routeHelper}
                />
            </FluentProvider>
        );
    }
}