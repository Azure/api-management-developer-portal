import * as React from "react";
import { useEffect, useState } from "react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { Tag } from "../../../../../models/tag";
import { Page } from "../../../../../models/page";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { fuiTheme } from "../../../../../constants/fuiTheme";
import { ApiDetailsBanner } from "./ApiDetailsBanner";

interface ApiDetailsProps {
    changeLogPageUrl?: string;
}

interface ApiDetailsState {
    apiName: string
}

const loadData = async (apiService: ApiService, apiName: string) => {
    let api: Api;

    try {
        api = await apiService.getApi(`apis/${apiName}`);
    } catch (error) {
        throw new Error(`Unable to load the API. Error: ${error.message}`);
    }

    return api;
}

const ApiDetailsFC = ({ apiService, apiName }: ApiDetailsProps & { apiService: ApiService, apiName: string}) => {
    const [working, setWorking] = useState(false)
    const [pageNumber, setPageNumber] = useState(1)
    const [api, setApi] = useState<Api>()

    useEffect(() => {
        if (apiName) {
            setWorking(true)
            loadData(apiService, apiName)
                .then(api => setApi(api))
                .finally(() => setWorking(false))
        }
    }, [apiService, apiName])

    return (
        <>
            {api && <ApiDetailsBanner api={api} apiService={apiService} /> }
        </>
    );
}

export class ApiDetails extends React.Component<ApiDetailsProps, ApiDetailsState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    constructor(props: ApiDetailsProps) {
        super(props);

        this.state = {
            apiName: null
        }
    }

    componentDidMount(): void {
        console.log(this.props);
        this.getApiName();
    }

    getApiName = (): void => {
        const apiName = this.routeHelper.getApiName();
        this.setState({ apiName });
    }


    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ApiDetailsFC
                    {...this.props}
                    apiService={this.apiService}
                    apiName={this.state.apiName}
                />
            </FluentProvider>
        );
    }
}
