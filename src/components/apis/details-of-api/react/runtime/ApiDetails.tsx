import * as React from "react";
import { useEffect, useState } from "react";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Stack } from "@fluentui/react";
import { Badge, Body1, Body1Strong, Dropdown, FluentProvider, Link, Option, Spinner, Title1 } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes"
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TypeOfApi, fuiTheme } from "../../../../../constants";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

interface ApiDetailsProps {
    changeLogPageUrl?: string
}

interface ApiDetailsState {
    apiName: string
}

enum TDefinition {
    "wsdl" = "wsdl",
    "wadl" = "wadl",
    "openapiyaml" = "openapi",
    "openapijson3" = "openapi+json",
    "openapijson2" = "swagger"
}

const originalVersion = "Original";

const ApiDetailsFC = ({
    apiName,
    apiService,
    routeHelper,
    router,
    changeLogPageUrl
}: ApiDetailsProps & { apiName: string, apiService: ApiService, routeHelper: RouteHelper, router: Router }) => {
    const [working, setWorking] = useState<boolean>(false);
    const [api, setApi] = useState<Api>();
    const [versionedApis, setVersionedApis] = useState<Api[]>([]);

    useEffect(() => {
        if (apiName) {
            setWorking(true);
            loadApis()
                .then(loadedApis => {
                    setApi(loadedApis.api);
                    setVersionedApis(loadedApis.versionedApis);
                })
                .finally(() => setWorking(false))
        }
    }, [apiName, apiService]);

    const loadApis = async (): Promise<{api: Api, versionedApis: Api[]}> => {
        let api: Api;
        let versionedApis: Api[];
    
        try {
            api = await apiService.getApi(`apis/${apiName}`);

            if (api.apiVersionSet && api.apiVersionSet.id) {
                versionedApis = await apiService.getApisInVersionSet(api.apiVersionSet.id);
                versionedApis.forEach(x => x.apiVersion = x.apiVersion || originalVersion);
            }
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }
    
        return {api, versionedApis};
    }

    const selectApiVersion = (versionedApiName: string): void => {
        if (apiName !== versionedApiName) {
            const versionedApiUrl = routeHelper.getApiReferenceUrl(versionedApiName);
            router.navigateTo(versionedApiUrl);
        }
    }

    const downloadApiDefinition = async (definitionType: TDefinition): Promise<void> => {
        let exportObject = await apiService.exportApi(api.id, definitionType);
        let fileName = api.name;
        let fileType: string = KnownMimeTypes.Json;

        switch (definitionType) {
            case "wsdl":
            case "wadl":
                fileType = KnownMimeTypes.Xml;
                fileName = `${fileName}.${definitionType}.xml`;
                break;
            case "openapi":
                fileName = `${fileName}.yaml`;
                break;
            default:
                fileName = `${fileName}.json`;
                exportObject = JSON.stringify(exportObject, null, 4);
                break;
        }
        download(exportObject, fileName, fileType);
    }

    const download = (data: string, filename: string, type: string): void => {
        const file = new Blob([data], { type: type });
        const downloadLink = document.createElement("a");
        const url = URL.createObjectURL(file);

        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.click();

        window.URL.revokeObjectURL(url);
    }

    return (
        <div className={"api-details-container"}>
            {working
                ? <Spinner />
                : api
                    ? <>
                        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                            <Stack horizontal verticalAlign="center">
                                <Title1 className={"api-title"}>{api.displayName}</Title1>
                                {api.typeName && api.typeName !== "REST" && <Badge appearance="outline">{api.typeName}</Badge>}
                            </Stack>
                            {changeLogPageUrl && api.type !== TypeOfApi.graphQL && api.type !== TypeOfApi.webSocket && 
                                <Link href={routeHelper.getApiReferenceUrl(apiName, changeLogPageUrl)}>View changelog</Link>
                            }
                        </Stack>
                        {(versionedApis?.length > 0 || (api.type !== TypeOfApi.graphQL && api.type !== TypeOfApi.webSocket)) && 
                            <Stack horizontal verticalAlign="center" className={"api-details-dropdowns"}>
                                {versionedApis?.length > 0 && 
                                    <Stack horizontal verticalAlign="center">
                                        <Body1Strong>Version</Body1Strong>
                                        <Dropdown
                                            defaultSelectedOptions={[api.name]}
                                            value={api.apiVersion ?? originalVersion}
                                            className={"api-details-dropdown"}
                                            onOptionSelect={(e, data) => selectApiVersion(data.optionValue)}
                                        >
                                            {versionedApis.map(versionedApi =>
                                                <Option key={versionedApi.name} value={versionedApi.name}>
                                                    {versionedApi.apiVersion}
                                                </Option>
                                            )}
                                        </Dropdown>
                                    </Stack>
                                }
                                {api.type !== TypeOfApi.graphQL && api.type !== TypeOfApi.webSocket &&
                                    <Stack horizontal verticalAlign="center">
                                        <Body1Strong>Download definition</Body1Strong>
                                        <Dropdown
                                            placeholder="Select definition type"
                                            className={"api-details-dropdown"}
                                            onOptionSelect={(e, data) => downloadApiDefinition(data.optionValue as TDefinition)}
                                        >
                                            <Option value={TDefinition.openapiyaml}>Open API 3 (YAML)</Option>
                                            <Option value={TDefinition.openapijson3}>Open API 3 (JSON)</Option>
                                            <Option value={TDefinition.openapijson2}>Open API 2 (JSON)</Option>
                                            <Option value={TDefinition.wadl}>WADL</Option>
                                            {api.type === TypeOfApi.soap && <Option value={TDefinition.wsdl}>WSDL</Option>}
                                        </Dropdown>
                                    </Stack>
                                }
                            </Stack>
                        }
                        {api.description &&
                            <Body1 block><MarkdownProcessor markdownToDisplay={api.description} /></Body1>
                        }
                        {(api.contact || api.license || api.termsOfServiceUrl) &&
                            <div className={"api-additional-info"}>
                                {api.contact && 
                                    <div className={"api-additional-info-block"}>
                                        <Body1 block>Contact:</Body1>
                                        {api.contact.name && <Body1 block>{api.contact.name}</Body1>}
                                        {api.contact.email && <Body1 block><Link href={`mailto:${api.contact.email}`}>{api.contact.email}</Link></Body1>}
                                        {api.contact.url && <Link href={api.contact.url}>{api.contact.url}</Link>}
                                    </div>
                                }
                                {api.license &&
                                    <div className={"api-additional-info-block"}>
                                        <Body1 block>License:</Body1>
                                        {api.license.url ? <Link href={api.license.url}>{api.license.name}</Link> : <Body1>{api.license.name}</Body1>}
                                    </div>
                                }
                                {api.termsOfServiceUrl &&
                                    <div className={"api-additional-info-block"}>
                                        <Body1 block>Additional resources:</Body1>
                                        <Link href={api.termsOfServiceUrl}>Terms and conditions</Link>
                                    </div>
                                }
                            </div>
                        }
                      </>
                    : <Body1>No API found.</Body1>
            }

        </div>
    );
}

export class ApiDetails extends React.Component<ApiDetailsProps, ApiDetailsState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;
    
    @Resolve("router")
    public router: Router;

    constructor(props: ApiDetailsProps) {
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
                <ApiDetailsFC
                    {...this.props}
                    apiName={this.state.apiName}
                    apiService={this.apiService}
                    routeHelper={this.routeHelper}
                    router={this.router}
                />
            </FluentProvider>
        );
    }
}