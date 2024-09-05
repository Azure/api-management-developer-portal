import * as React from "react";
import { useEffect, useState } from "react";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { HttpClient } from "@paperbits/common/http/httpClient";
import { Stack, } from "@fluentui/react";
import {
    Badge,
    Body1,
    Body1Strong,
    Button,
    Caption1Strong,
    Link,
    Spinner,
    Subtitle1,
    Subtitle2,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip 
} from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { OAuthService } from "../../../../../services/oauthService";
import { TenantService } from "../../../../../services/tenantService";
import { Api } from "../../../../../models/api";
import { Operation } from "../../../../../models/operation";
import { Tag } from "../../../../../models/tag";
import { Request } from "../../../../../models/request";
import { Response } from "../../../../../models/response";
import {
    TypeDefinition,
    TypeDefinitionProperty,
    TypeDefinitionPropertyTypeArrayOfPrimitive,
    TypeDefinitionPropertyTypeArrayOfReference,
    TypeDefinitionPropertyTypeCombination,
    TypeDefinitionPropertyTypePrimitive,
    TypeDefinitionPropertyTypeReference
} from "../../../../../models/typeDefinition";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";
import { OperationRepresentation, TSchemaView } from "./OperationRepresentation";
import { TypeDefinitionInList } from "./TypeDefinitions";
import { OperationDetailsTable, getRequestUrl, scrollToOperation } from "./utils";
import { OperationConsole } from "./OperationConsole";

export const OperationDetails = ({
    apiName,
    operationName,
    apiService,
    usersService,
    productService,
    oauthService,
    tenantService,
    routeHelper,
    settingsProvider,
    sessionManager,
    httpClient,
    enableConsole,
    useCorsProxy,
    includeAllHostnames,
    enableScrollTo,
    showExamples,
    defaultSchemaView
}: OperationDetailsRuntimeProps & {
    apiName: string,
    operationName: string,
    apiService: ApiService,
    usersService: UsersService,
    productService: ProductService,
    oauthService: OAuthService,
    tenantService: TenantService,
    routeHelper: RouteHelper,
    settingsProvider: ISettingsProvider,
    sessionManager: SessionManager,
    httpClient: HttpClient
}) => {
    const [working, setWorking] = useState<boolean>(false);
    const [api, setApi] = useState<Api>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [request, setRequest] = useState<Request>(null);
    const [responses, setResponses] = useState<Response[]>(null);
    const [hostnames, setHostnames] = useState<string[]>([]);
    const [definitions, setDefinitions] = useState<TypeDefinition[]>([]);
    const [requestUrl, setRequestUrl] = useState<string>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!apiName) return;
        
        setWorking(true);
        Promise.all([
            loadApi().then(loadedApi => setApi(loadedApi)),
            loadGatewayInfo().then(hostnames => {
                hostnames?.length > 0 && setHostnames(hostnames);
            }),
            loadOperation().then(loadedValues => {
                setOperation(loadedValues.operation);
                setTags(loadedValues.tags);
                setDefinitions(loadedValues.definitions);
                setRequest(loadedValues.operation?.request);
                setResponses(loadedValues.operation?.getMeaningfulResponses());
            })
        ])
        .catch(error => new Error(`Unable to load the operation details. Error: ${error.message}`))
        .finally(() => {
            setWorking(false);
            enableScrollTo && scrollToOperation();
        });
    }, [apiName, operationName]);

    useEffect(() => {
        setRequestUrl(getRequestUrl(api, operation, hostnames?.[0]));
    }, [api, operation, hostnames]);

    useEffect(() => {
        isCopied && setTimeout(() => setIsCopied(false), 5000);
    }, [isCopied]);

    const loadApi = async (): Promise<Api> => {
        let api: Api;

        try {
            api = await apiService.getApi(`apis/${apiName}`);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return api;
    }

    const loadOperation = async (): Promise<{operation: Operation, tags: Tag[], definitions: TypeDefinition[]}> => {
        let operation: Operation;
        let tags: Tag[];
        let definitions: TypeDefinition[];

        try {
            if (operationName) {
                [operation, tags] = await Promise.all([
                    apiService.getOperation(`apis/${apiName}/operations/${operationName}`),
                    apiService.getOperationTags(`apis/${apiName}/operations/${operationName}`)
                ]);
                operation && (definitions = await loadDefinitions(operation));
            } else {
                const operations = await apiService.getOperations(`apis/${apiName}`);
                operation = operations?.value[0];
                operation &&
                    ([tags, definitions] = await Promise.all([
                        await apiService.getOperationTags(`apis/${apiName}/operations/${operation.name}`),
                        await loadDefinitions(operation)
                    ]));
            }
        } catch (error) {
            throw new Error(`Unable to load the operation. Error: ${error.message}`);
        }

        return {operation, tags, definitions};
    }

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName, includeAllHostnames);
    }

    const loadDefinitions = async (operation: Operation): Promise<TypeDefinition[]> => {
        // const cachedDefinitions = definitionsCache.getItem(operation.id);
        // if (cachedDefinitions) {
        //     this.definitions(cachedDefinitions);
        //     return;
        // }

        const schemaIds = [];
        const apiId = `apis/${apiName}/schemas`;

        const representations = operation.responses
            .map(response => response.representations)
            .concat(operation.request.representations)
            .flat();

        representations
            .map(representation => representation.schemaId)
            .filter(schemaId => !!schemaId)
            .forEach(schemaId => {
                if (!schemaIds.includes(schemaId)) {
                    schemaIds.push(schemaId);
                }
            });

        const typeNames = representations
            .filter(p => !!p.typeName)
            .map(p => p.typeName)
            .filter((item, pos, self) => self.indexOf(item) === pos);

        const schemasPromises = schemaIds.map(schemaId => apiService.getApiSchema(`${apiId}/${schemaId}`));
        const schemas = await Promise.all(schemasPromises);
        const definitions = schemas.map(x => x.definitions).flat();

        let lookupResult = [...typeNames];

        while (lookupResult.length > 0) {
            const references = definitions.filter(definition => lookupResult.indexOf(definition.name) !== -1);

            lookupResult = references.length === 0
                ? []
                : lookupReferences(references, typeNames);

            if (lookupResult.length > 0) {
                typeNames.push(...lookupResult);
            }
        }

        const typedDefinitions = definitions.filter(definition => typeNames.indexOf(definition.name) !== -1);
        //this.definitionsCache.setItem(operation.id, typedDefinitions);
        
        return typedDefinitions;
    }

    const lookupReferences = (definitions: TypeDefinition[], skipNames: string[]): string[] => {
        const result: string[] = [];
        const objectDefinitions: TypeDefinitionProperty[] = definitions
            .map(definition => definition.properties)
            .filter(definition => !!definition)
            .flat();

        objectDefinitions.forEach(definition => {
            processDefinition(definition).forEach(processedDefinition => result.push(processedDefinition));
        });

        return result.filter(x => !skipNames.includes(x));
    }

    const processDefinition = (definition: TypeDefinitionProperty, result: string[] = []): string[] => {
        if (definition.kind === "indexed") {
            result.push(definition.type["name"]);
        }

        if ((definition.type instanceof TypeDefinitionPropertyTypeReference
            || definition.type instanceof TypeDefinitionPropertyTypeArrayOfPrimitive
            || definition.type instanceof TypeDefinitionPropertyTypeArrayOfReference)) {
            result.push(definition.type.name);
        }

        if (definition.type instanceof TypeDefinitionPropertyTypeCombination) {
            result.push(definition.name);

            if (definition.type.combination) {
                definition.type.combination.forEach(combinationProperty => {
                    result.push(combinationProperty["name"]);
                });
            } else {
                definition.type.combinationReferences.forEach(combinationReference => {
                    result.push(combinationReference);
                });
            }
        }

        if (definition.type instanceof TypeDefinitionPropertyTypePrimitive && definition.type.name === "object") {
            if (definition.name === "Other properties") {
                definition["properties"].forEach(definitionProp => {
                    processDefinition(definitionProp).forEach(processedDefinition => result.push(processedDefinition));
                });
            } else {
                result.push(definition.name);
            }
        }

        return result;
    }

    const getReferenceUrl = (typeName: string): string => {
        if (!operationName) return;

        return routeHelper.getDefinitionAnchor(apiName, operationName, typeName);
    }

    const getReferenceId = (definitionName: string): string => {
        if (!operationName) return;

        return routeHelper.getDefinitionReferenceId(apiName, operationName, definitionName);
    }

    return (
        <div className={"operation-details-container"}>
            <Subtitle1 block className={"operation-details-title"} id={"operation"}>Operation</Subtitle1>
            {working 
                ? <Spinner label="Loading..." labelPosition="below" size="small" />
                : !operation
                    ? <Body1>No operation selected.</Body1> 
                    : <div className={"operation-details-content"}>
                        <OperationConsole
                            isOpen={isConsoleOpen}
                            setIsOpen={setIsConsoleOpen}
                            api={api}
                            operation={operation}
                            hostnames={hostnames}
                            useCorsProxy={useCorsProxy}
                            apiService={apiService}
                            usersService={usersService}
                            productService={productService}
                            oauthService={oauthService}
                            tenantService={tenantService}
                            routeHelper={routeHelper}
                            settingsProvider={settingsProvider}
                            sessionManager={sessionManager}
                            httpClient={httpClient}
                        />
                        <div className={"operation-table"}>
                            <div className={"operation-table-header"}>
                                <Subtitle2>{operation.displayName}</Subtitle2>
                                {operation.description &&
                                    <Body1 block className={"operation-description"}>
                                        <MarkdownProcessor markdownToDisplay={operation.description} />
                                    </Body1>
                                }
                                {tags.length > 0 &&
                                    <Stack horizontal className={"operation-tags"}>
                                        <Body1Strong>Tags:</Body1Strong>
                                        {tags.map(tag => <Badge key={tag.id} color="important" appearance="outline">{tag.name}</Badge>)}
                                    </Stack>
                                }
                            </div>
                            <div className={"operation-table-body"}>
                                <div className={"operation-table-body-row"}>
                                    <Caption1Strong className={`operation-info-caption operation-method method-${operation.method}`}>{operation.method}</Caption1Strong>
                                    <Body1 className={"operation-text"}>{requestUrl}</Body1>
                                    <Tooltip
                                        content={isCopied ? "Copied to clipboard!" : "Copy to clipboard"}
                                        relationship={"description"}
                                        hideDelay={isCopied ? 3000 : 250}
                                    >
                                        <Button
                                            icon={<Copy16Regular />}
                                            appearance="transparent"
                                            onClick={() => {
                                                navigator.clipboard.writeText(requestUrl);
                                                setIsCopied(true);
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        {enableConsole && <Button onClick={() => setIsConsoleOpen(true)}>Try this operation</Button>}
                        {request && request.isMeaningful() &&
                            <div className={"operation-request"}>
                                <Subtitle1 block className={"operation-subtitle1"}>Request</Subtitle1>
                                {request.description && <MarkdownProcessor markdownToDisplay={request.description} />}
                                {operation.parameters?.length > 0 &&
                                    <>
                                        <Subtitle2 block className={"operation-subtitle2"}>Request parameters</Subtitle2>
                                        <OperationDetailsTable tableName={"Request parameters table"} tableContent={operation.parameters} showExamples={showExamples} showIn={true} />
                                    </>
                                }
                                {request.headers?.length > 0 &&
                                    <>
                                        <Subtitle2 block className={"operation-subtitle2"}>Request headers</Subtitle2>
                                        <OperationDetailsTable tableName={"Request headers table"} tableContent={request.headers} showExamples={showExamples} showIn={false} />
                                    </>
                                }
                                {request.meaningfulRepresentations()?.length > 0 &&
                                    <>
                                        <Subtitle2 block className={"operation-subtitle2"}>Request body</Subtitle2>
                                        <OperationRepresentation
                                            representations={request.meaningfulRepresentations()}
                                            definitions={definitions}
                                            showExamples={showExamples}
                                            defaultSchemaView={defaultSchemaView as TSchemaView}
                                            getReferenceUrl={getReferenceUrl}
                                        />
                                    </>
                                }
                            </div>
                        }
                        {responses?.length > 0 &&
                            responses.map(response => (
                                <div key={response.statusCode.code} className={"operation-response"}>
                                    <Subtitle1 block className={"operation-subtitle1"}>
                                        Response: {response.statusCode.code} {response.statusCode.description}
                                    </Subtitle1>
                                    {response.description && <MarkdownProcessor markdownToDisplay={response.description} />}
                                    {response.headers?.length > 0 &&
                                        <>
                                            <Subtitle2 block className={"operation-subtitle2"}>Response headers</Subtitle2>
                                            <OperationDetailsTable
                                                tableName={"Response headers table"}
                                                tableContent={response.headers}
                                                showExamples={false}
                                                showIn={false}
                                            />
                                        </>
                                    }
                                    {response.meaningfulRepresentations()?.length > 0 &&
                                        <OperationRepresentation
                                            representations={response.meaningfulRepresentations()}
                                            definitions={definitions}
                                            showExamples={showExamples}
                                            defaultSchemaView={defaultSchemaView as TSchemaView}
                                            getReferenceUrl={getReferenceUrl}
                                        />
                                    }
                                </div>
                        ))}
                        {definitions?.length > 0 &&
                            <div className={"operation-definitions"}>
                                <Subtitle1 block className={"operation-details-title"}>Definitions</Subtitle1>
                                <Table aria-label={"Definitions list"} className={"fui-table"}>
                                    <TableHeader>
                                        <TableRow className={"fui-table-headerRow"}>
                                            <TableHeaderCell><Body1Strong>Name</Body1Strong></TableHeaderCell>
                                            <TableHeaderCell><Body1Strong>Description</Body1Strong></TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {definitions.map(definition => (
                                            <TableRow key={definition.name} className={"fui-table-body-row"}>
                                                <TableCell>
                                                    <Link href={getReferenceUrl(definition.name)} title={definition.name} className={"truncate-text"}>
                                                        {definition.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell><Body1 title={definition.description}>
                                                    <MarkdownProcessor markdownToDisplay={definition.description} maxChars={250} truncate={true} />
                                                </Body1></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {definitions.map(definition => (
                                    <div key={definition.name} className={"operation-definition"}>
                                        <TypeDefinitionInList
                                            definition={definition}
                                            showExamples={showExamples}
                                            getReferenceUrl={getReferenceUrl}
                                            getReferenceId={getReferenceId}
                                            defaultSchemaView={defaultSchemaView as TSchemaView}
                                        />
                                    </div>
                                ))}
                            </div>
                        }
                      </div>
            }
        </div>
    );
}