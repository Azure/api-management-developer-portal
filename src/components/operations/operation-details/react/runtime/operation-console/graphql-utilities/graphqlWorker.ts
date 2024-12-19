/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import type { editor, Position, IRange, languages } from "monaco-editor";
import type { SchemaResponse, CompletionItem as GraphQLCompletionItem } from "graphql-language-service";
import { FormattingOptions, ICreateData } from "./typings";
import { getRange, LanguageService } from "graphql-language-service";

import {
    toGraphQLPosition,
    toMonacoRange,
    toMarkerData,
    toCompletion,
} from "./utils";

import type { GraphQLSchema, DocumentNode } from "graphql";

export type MonacoCompletionItem = languages.CompletionItem & {
    isDeprecated?: boolean;
    deprecationReason?: string | null;
};

export class GraphQLWorker {
    private languageService: LanguageService;
    private formattingOptions: FormattingOptions | undefined;

    constructor(createData: ICreateData) {
        this.languageService = new LanguageService(createData.languageConfig);
        this.formattingOptions = createData.formattingOptions;
    }

    public async getSchemaResponse(_uri?: string): Promise<SchemaResponse | null> {
        return this.languageService.getSchemaResponse();
    }

    public async setSchema(schema: string): Promise<void> {
        await this.languageService.setSchema(schema);
    }

    public async loadSchema(_uri?: string): Promise<GraphQLSchema | null> {
        return this.languageService.getSchema();
    }

    public async doValidation(model: editor.IReadOnlyModel): Promise<editor.IMarkerData[]> {
        const document = this.getTextDocument(model);
        const graphqlDiagnostics = await this.languageService.getDiagnostics(null, document);

        return graphqlDiagnostics.map(toMarkerData);
    }

    public async doComplete(model: editor.IReadOnlyModel, position: Position): Promise<(GraphQLCompletionItem & { range: IRange })[]> {
        const document = this.getTextDocument(model);
        const graphQLPosition = toGraphQLPosition(position);
        const suggestions = await this.languageService.getCompletion(null, document, graphQLPosition);

        return suggestions.map(suggestion => toCompletion(suggestion));
    }

    public async doHover(model: editor.IReadOnlyModel, position: Position) {
        const document = this.getTextDocument(model);
        const graphQLPosition = toGraphQLPosition(position);
        const hover = await this.languageService.getHover(null, document, graphQLPosition);

        return {
            content: hover,
            range: toMonacoRange(
                getRange({ column: graphQLPosition.character, line: graphQLPosition.line }, document),
            ),
        };
    }

    public async doFormat(text: string): Promise<string> {
        const prettierStandalone = await import("prettier/standalone");
        const prettierGraphqlParser = await import("prettier/parser-graphql");

        return prettierStandalone.format(text, {
            ...this.formattingOptions,
            parser: "graphql",
            plugins: [prettierGraphqlParser],
        });
    }

    public async doParse(text: string): Promise<DocumentNode> {
        return this.languageService.parse(text);
    }

    private getTextDocument(model: editor.IReadOnlyModel): string {
        return model.getValue();
    }
}
