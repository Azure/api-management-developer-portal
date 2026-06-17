/**
 * Local LanguageService implementation backed by graphql-language-service v5's
 * functional API.
 *
 * The `LanguageService` class together with the `SchemaResponse`, `SchemaConfig`
 * and `GraphQLLanguageConfig` types were removed from `graphql-language-service`
 * in v5. This module reimplements the small surface that the GraphQL console
 * worker relies on, on top of the still-supported functional API
 * (`getAutocompleteSuggestions`, `getDiagnostics`, `getHoverInformation`) and
 * graphql 17's `buildSchema` / `parse`.
 */
import {
    getAutocompleteSuggestions,
    getDiagnostics,
    getHoverInformation,
    CompletionItem,
    Diagnostic,
    IPosition,
} from "graphql-language-service";
import { buildSchema, parse, DocumentNode, GraphQLSchema } from "graphql";

export interface SchemaConfig {
    uri?: string;
    fileMatch?: string[];
    requestOpts?: unknown;
    [key: string]: unknown;
}

export interface SchemaResponse {
    schema?: GraphQLSchema;
    [key: string]: unknown;
}

export interface GraphQLLanguageConfig {
    schemaConfig?: SchemaConfig;
    schemaLoader?: (config: SchemaConfig) => unknown;
    [key: string]: unknown;
}

export class LanguageService {
    private schema: GraphQLSchema | null = null;
    private schemaString: string | null = null;

    constructor(_config?: GraphQLLanguageConfig) {
        // The schema is provided asynchronously through setSchema().
    }

    public async getSchema(): Promise<GraphQLSchema | null> {
        return this.schema;
    }

    public async getSchemaResponse(): Promise<SchemaResponse | null> {
        return this.schema ? { schema: this.schema } : null;
    }

    public async setSchema(schema: string): Promise<void> {
        this.schemaString = schema;
        this.schema = buildSchema(schema);
    }

    public async getDiagnostics(_uri: string | null, document: string): Promise<Diagnostic[]> {
        if (!this.schema) {
            return [];
        }
        return getDiagnostics(document, this.schema);
    }

    public async getCompletion(_uri: string | null, document: string, position: IPosition): Promise<CompletionItem[]> {
        if (!this.schema) {
            return [];
        }
        return getAutocompleteSuggestions(this.schema, document, position);
    }

    public async getHover(_uri: string | null, document: string, position: IPosition): Promise<string> {
        if (!this.schema) {
            return "";
        }

        const contents = getHoverInformation(this.schema, document, position, undefined, { useMarkdown: true });

        if (typeof contents === "string") {
            return contents;
        }

        if (Array.isArray(contents)) {
            return contents.map(entry => (typeof entry === "string" ? entry : entry.value)).join("\n\n");
        }

        return contents ? (contents as { value: string }).value : "";
    }

    public parse(text: string): DocumentNode {
        return parse(text);
    }
}
