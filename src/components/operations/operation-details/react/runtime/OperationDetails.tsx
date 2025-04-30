import * as React from "react";
import { useEffect, useState } from "react";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";
import { HttpClient } from "@paperbits/common/http/httpClient";
import { Stack } from "@fluentui/react";
import {
    Badge,
    Button,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip,
} from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { InfoPanel } from "@microsoft/api-docs-ui";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { OAuthService } from "../../../../../services/oauthService";
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
    TypeDefinitionPropertyTypeReference,
} from "../../../../../models/typeDefinition";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { OperationDetailsRuntimeProps } from "./OperationDetailsRuntime";
import {
    OperationRepresentation,
    TSchemaView,
} from "./OperationRepresentation";
import { TypeDefinitionInList } from "./TypeDefinitions";
import {
    OperationDetailsTable,
    getRequestUrl,
    scrollToOperation,
} from "./utils";
import { OperationConsole } from "./OperationConsole";

export const OperationDetails = ({
    apiName,
    operationName,
    apiService,
    usersService,
    productService,
    oauthService,
    routeHelper,
    settingsProvider,
    sessionManager,
    httpClient,
    enableConsole,
    useCorsProxy,
    enableScrollTo,
    showExamples,
    defaultSchemaView,
}: OperationDetailsRuntimeProps & {
    apiName: string;
    operationName: string;
    apiService: ApiService;
    usersService: UsersService;
    productService: ProductService;
    oauthService: OAuthService;
    routeHelper: RouteHelper;
    settingsProvider: ISettingsProvider;
    sessionManager: SessionManager;
    httpClient: HttpClient;
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
            loadApi().then((loadedApi) => setApi(loadedApi)),
            loadGatewayInfo().then((hostnames) => {
                hostnames?.length > 0 && setHostnames(hostnames);
            }),
            loadOperation().then((loadedValues) => {
                setOperation(loadedValues.operation);
                setTags(loadedValues.tags);
                setDefinitions(loadedValues.definitions);
                setRequest(loadedValues.operation?.request);
                setResponses(loadedValues.operation?.getMeaningfulResponses());
            }),
        ])
            .catch(
                (error) =>
                    new Error(
                        `Unable to load the operation details. Error: ${error.message}`
                    )
            )
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
    };

    const loadOperation = async (): Promise<{
        operation: Operation;
        tags: Tag[];
        definitions: TypeDefinition[];
    }> => {
        let operation: Operation;
        let tags: Tag[];
        let definitions: TypeDefinition[];

        try {
            if (operationName) {
                [operation, tags] = await Promise.all([
                    apiService.getOperation(apiName, operationName),
                    apiService.getOperationTags(`apis/${apiName}/operations/${operationName}`)
                ]);
                operation && (definitions = await loadDefinitions(operation));
            } else {
                const operations = await apiService.getOperations(
                    `apis/${apiName}`
                );
                operation = operations?.value[0];
                operation &&
                    ([tags, definitions] = await Promise.all([
                        await apiService.getOperationTags(
                            `apis/${apiName}/operations/${operation.name}`
                        ),
                        await loadDefinitions(operation),
                    ]));
            }
        } catch (error) {
            throw new Error(
                `Unable to load the operation. Error: ${error.message}`
            );
        }

        return { operation, tags, definitions };
    };

    const loadGatewayInfo = async (): Promise<string[]> => {
        return await apiService.getApiHostnames(apiName);
    }

    const loadDefinitions = async (
        operation: Operation
    ): Promise<TypeDefinition[]> => {
        const schemaIds = [];
        const apiId = `apis/${apiName}/schemas`;

        const representations = operation.responses
            .map((response) => response.representations)
            .concat(operation.request.representations)
            .flat();

        representations
            .map((representation) => representation.schemaId)
            .filter((schemaId) => !!schemaId)
            .forEach((schemaId) => {
                if (!schemaIds.includes(schemaId)) {
                    schemaIds.push(schemaId);
                }
            });

        const typeNames = representations
            .filter((p) => !!p.typeName)
            .map((p) => p.typeName)
            .filter((item, pos, self) => self.indexOf(item) === pos);

        const schemasPromises = schemaIds.map((schemaId) =>
            apiService.getApiSchema(`${apiId}/${schemaId}`)
        );
        const schemas = await Promise.all(schemasPromises);
        const definitions = schemas.map((x) => x.definitions).flat();

        let lookupResult = [...typeNames];

        while (lookupResult.length > 0) {
            const references = definitions.filter(
                (definition) => lookupResult.indexOf(definition.name) !== -1
            );

            lookupResult =
                references.length === 0
                    ? []
                    : lookupReferences(references, typeNames);

            if (lookupResult.length > 0) {
                typeNames.push(...lookupResult);
            }
        }

        const typedDefinitions = definitions.filter(
            (definition) => typeNames.indexOf(definition.name) !== -1
        );

        return typedDefinitions;
    };

    const lookupReferences = (
        definitions: TypeDefinition[],
        skipNames: string[]
    ): string[] => {
        const result: string[] = [];
        const objectDefinitions: TypeDefinitionProperty[] = definitions
            .map((definition) => definition.properties)
            .filter((definition) => !!definition)
            .flat();

        objectDefinitions.forEach((definition) => {
            processDefinition(definition).forEach((processedDefinition) =>
                result.push(processedDefinition)
            );
        });

        return result.filter((x) => !skipNames.includes(x));
    };

    const processDefinition = (
        definition: TypeDefinitionProperty,
        result: string[] = []
    ): string[] => {
        if (definition.kind === "indexed") {
            result.push(definition.type["name"]);
        }

        if (
            definition.type instanceof TypeDefinitionPropertyTypeReference ||
            definition.type instanceof
                TypeDefinitionPropertyTypeArrayOfPrimitive ||
            definition.type instanceof
                TypeDefinitionPropertyTypeArrayOfReference
        ) {
            result.push(definition.type.name);
        }

        if (definition.type instanceof TypeDefinitionPropertyTypeCombination) {
            result.push(definition.name);

            if (definition.type.combination) {
                definition.type.combination.forEach((combinationProperty) => {
                    result.push(combinationProperty["name"]);
                });
            } else {
                definition.type.combinationReferences.forEach(
                    (combinationReference) => {
                        result.push(combinationReference);
                    }
                );
            }
        }

        if (
            definition.type instanceof TypeDefinitionPropertyTypePrimitive &&
            definition.type.name === "object"
        ) {
            if (definition.name === "Other properties") {
                definition["properties"].forEach((definitionProp) => {
                    processDefinition(
                        definitionProp
                    ).forEach((processedDefinition) =>
                        result.push(processedDefinition)
                    );
                });
            } else {
                result.push(definition.name);
            }
        }

        return result;
    };

    const getReferenceUrl = (typeName: string): string => {
        if (!operationName) return;

        return routeHelper.getDefinitionAnchor(
            apiName,
            operationName,
            typeName
        );
    };

    const getReferenceId = (definitionName: string): string => {
        if (!operationName) return;

        return routeHelper.getDefinitionReferenceId(
            apiName,
            operationName,
            definitionName
        );
    };

    return (
        <div className={"operation-details-container"}>
            {working ? (
                <Spinner
                    label="Loading..."
                    labelPosition="below"
                    size="small"
                />
            ) : !operation ? (
                <span>No operation selected.</span>
            ) : (
                <>
                    <h2 id={"operation"}>
                        {operation.displayName}
                    </h2>
                    {operation.description && (
                        <div>
                            <MarkdownProcessor
                                markdownToDisplay={operation.description}
                            />
                        </div>
                    )}
                    <div className={"operation-details-content"}>
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
                            routeHelper={routeHelper}
                            settingsProvider={settingsProvider}
                            sessionManager={sessionManager}
                            httpClient={httpClient}
                        />
                        <InfoPanel
                            title={
                                tags.length > 0 && (
                                    <Stack
                                        horizontal
                                        className={"operation-tags"}
                                    >
                                        <span className="strong">Tags:</span>
                                        {tags.map((tag) => (
                                            <Badge
                                                key={tag.id}
                                                color="important"
                                                appearance="outline"
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </Stack>
                                )
                            }
                            children={
                                <div className="operation-table-body-row">
                                    <span className={`caption1-strong operation-info-caption operation-method method-${operation.method}`}>
                                        {operation.method}
                                    </span>
                                    <span className={"operation-text"}>
                                        {requestUrl}
                                    </span>
                                    <Tooltip
                                        content={
                                            isCopied
                                                ? "Copied to clipboard!"
                                                : "Copy to clipboard"
                                        }
                                        relationship={"description"}
                                        hideDelay={isCopied ? 3000 : 250}
                                    >
                                        <Button
                                            icon={<Copy16Regular />}
                                            appearance="transparent"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    requestUrl
                                                );
                                                setIsCopied(true);
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            }
                        />
                        {enableConsole && (
                            <button
                                className="button"
                                onClick={() => setIsConsoleOpen(true)}
                            >
                                Try this operation
                            </button>
                        )}
                        {request && request.isMeaningful() && (
                            <div className={"operation-request"}>
                                <h4 className={"operation-subtitle1"}>
                                    Request
                                </h4>
                                {request.description && (
                                    <MarkdownProcessor
                                        markdownToDisplay={request.description}
                                    />
                                )}
                                {operation.parameters?.length > 0 && (
                                    <>
                                        <h5 className={"operation-subtitle2"}>
                                            Request parameters
                                        </h5>
                                        <OperationDetailsTable
                                            tableName={
                                                "Request parameters table"
                                            }
                                            tableContent={operation.parameters}
                                            showExamples={showExamples}
                                            showIn={true}
                                        />
                                    </>
                                )}
                                {request.headers?.length > 0 && (
                                    <>
                                        <h5 className={"operation-subtitle2"}>
                                            Request headers
                                        </h5>
                                        <OperationDetailsTable
                                            tableName={"Request headers table"}
                                            tableContent={request.headers}
                                            showExamples={showExamples}
                                            showIn={false}
                                            isHeaders={true}
                                        />
                                    </>
                                )}
                                {request.meaningfulRepresentations()?.length >
                                    0 && (
                                    <>
                                        <h5 className={"operation-subtitle2"}>
                                            Request body
                                        </h5>
                                        <OperationRepresentation
                                            representations={request.meaningfulRepresentations()}
                                            definitions={definitions}
                                            showExamples={showExamples}
                                            defaultSchemaView={
                                                defaultSchemaView as TSchemaView
                                            }
                                            getReferenceUrl={getReferenceUrl}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                        {responses?.length > 0 &&
                            responses.map((response) => (
                                <div
                                    key={response.statusCode.code}
                                    className={"operation-response"}
                                >
                                    <h4 className={"operation-subtitle1"}>
                                        Response: {response.statusCode.code}{" "}
                                        {response.statusCode.description}
                                    </h4>
                                    {response.description && (
                                        <MarkdownProcessor
                                            markdownToDisplay={
                                                response.description
                                            }
                                        />
                                    )}
                                    {response.headers?.length > 0 && (
                                        <>
                                            <h5
                                                className={
                                                    "operation-subtitle2"
                                                }
                                            >
                                                Response headers
                                            </h5>
                                            <OperationDetailsTable
                                                tableName={
                                                    "Response headers table"
                                                }
                                                tableContent={response.headers}
                                                showExamples={false}
                                                showIn={false}
                                            />
                                        </>
                                    )}
                                    {response.meaningfulRepresentations()
                                        ?.length > 0 && (
                                        <OperationRepresentation
                                            representations={response.meaningfulRepresentations()}
                                            definitions={definitions}
                                            showExamples={showExamples}
                                            defaultSchemaView={
                                                defaultSchemaView as TSchemaView
                                            }
                                            getReferenceUrl={getReferenceUrl}
                                        />
                                    )}
                                </div>
                            ))}
                        {definitions?.length > 0 && (
                            <div className={"operation-definitions"}>
                                <h4 className={"operation-details-title"}>
                                    Definitions
                                </h4>
                                <ScrollableTableContainer>
                                    <Table
                                        aria-label={"Definitions list"}
                                        className={"fui-table"}
                                    >
                                        <TableHeader>
                                            <TableRow
                                                className={"fui-table-headerRow"}
                                            >
                                                <TableHeaderCell>
                                                    <span className="strong">
                                                        Name
                                                    </span>
                                                </TableHeaderCell>
                                                <TableHeaderCell>
                                                    <span className="strong">
                                                        Description
                                                    </span>
                                                </TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {definitions.map((definition) => (
                                                <TableRow
                                                    key={definition.name}
                                                    className={"fui-table-body-row"}
                                                >
                                                    <TableCell>
                                                        <a
                                                            href={getReferenceUrl(
                                                                definition.name
                                                            )}
                                                            title={definition.name}
                                                            className={
                                                                "truncate-text"
                                                            }
                                                        >
                                                            {definition.name}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            title={
                                                                definition.description
                                                            }
                                                        >
                                                            <MarkdownProcessor
                                                                markdownToDisplay={
                                                                    definition.description
                                                                }
                                                                maxChars={250}
                                                                truncate={true}
                                                            />
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollableTableContainer>

                                {definitions.map((definition) => (
                                    <div
                                        key={definition.name}
                                        className={"operation-definition"}
                                    >
                                        <TypeDefinitionInList
                                            definition={definition}
                                            showExamples={showExamples}
                                            getReferenceUrl={getReferenceUrl}
                                            getReferenceId={getReferenceId}
                                            defaultSchemaView={
                                                defaultSchemaView as TSchemaView
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
