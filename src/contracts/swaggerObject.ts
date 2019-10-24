export interface SwaggerObjectInfo {
    title: string;
    description: string;
    version: string;
}

export interface SwaggerParameter {
    name: string;
    in: string;
    required: boolean;
    description: string;
    type?: string;
    schema?: Object;
    default?: string;
    enum: string[];
}

export interface SwaggerOperation {
    operationId: string;
    description: string;
    parameters: SwaggerParameter[];
    responses: Object;
    security: SecurityType[];
    summary: string;
}

export interface PathItem {
    [key: string]: SwaggerOperation;
}

export interface SwaggerPath {
    [key: string]: PathItem;
}

export interface SwaggerObject {
    swagger: string;
    info: SwaggerObjectInfo;
    host: string;
    basePath: string;
    schemes: string[];
    consumes: string[];
    produces: string[];
    paths: SwaggerPath;
    definitions?: Object;
    securityDefinitions?: SecurityDefinitions;
}

export interface SecurityDefinitions {
    apikeyQuery: SecurityType;
    apikeyHeader: SecurityType;
}

export interface SecurityType {
    type: string;
    name: string;
    in: string;
}