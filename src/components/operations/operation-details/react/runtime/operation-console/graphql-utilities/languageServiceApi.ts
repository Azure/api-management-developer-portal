/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import { SchemaConfig, SchemaResponse } from "graphql-language-service";
import type { Emitter } from "monaco-editor";
import type { FormattingOptions, ModeConfiguration } from "./typings";
import type { WorkerAccessor } from "./languageFeatures";


import {
    DocumentNode,
    FragmentDefinitionNode,
    GraphQLSchema,
    printSchema,
} from "graphql";


export interface LanguageServiceAPIOptions {
    languageId: string;
    schemaConfig: SchemaConfig;
    modeConfiguration: ModeConfiguration;
    formattingOptions: FormattingOptions;
}

export class LanguageServiceApi {
    private onDidChangeEmitter: Emitter<LanguageServiceApi>;
    private _schemaConfig: SchemaConfig = {};
    private _formattingOptions!: FormattingOptions;
    private _modeConfiguration!: ModeConfiguration;
    private _languageId: string;
    private _worker: WorkerAccessor | null;
    private _workerPromise: Promise<WorkerAccessor>;
    private _resolveWorkerPromise: (value: WorkerAccessor) => void = () => {
        // do nothing
    };
    private _schemaString: string | null = null;
    private _externalFragmentDefinitions:
        | string
        | FragmentDefinitionNode[]
        | null = null;

    constructor({
        languageId,
        schemaConfig,
        modeConfiguration,
        formattingOptions,
    }: LanguageServiceAPIOptions) {
        this.onDidChangeEmitter = new (<any>window).monaco.Emitter();

        this._worker = null;
        this._workerPromise = new Promise(resolve => {
            this._resolveWorkerPromise = resolve;
        });
        this._languageId = languageId;
        if (schemaConfig && schemaConfig.uri) {
            this.setSchemaConfig(schemaConfig);
        }
        this.setModeConfiguration(modeConfiguration);
        this.setFormattingOptions(formattingOptions);
    }

    public get onDidChange(): any { // IEvent<LanguageServiceAPI> {
        return this.onDidChangeEmitter.event;
    }

    public get languageId(): string {
        return this._languageId;
    }

    public get modeConfiguration(): ModeConfiguration {
        return this._modeConfiguration;
    }

    public get schemaConfig(): SchemaConfig {
        return this._schemaConfig;
    }

    public get formattingOptions(): FormattingOptions {
        return this._formattingOptions;
    }

    public get externalFragmentDefinitions() {
        return this._externalFragmentDefinitions;
    }

    public get hasSchema() {
        return Boolean(this._schemaString);
    }

    public get schemaString() {
        return this._schemaString;
    }

    public get worker(): Promise<WorkerAccessor> {
        if (this._worker) {
            return Promise.resolve(this._worker);
        }
        return this._workerPromise;
    }

    public setWorker(worker: WorkerAccessor) {
        this._worker = worker;
        this._resolveWorkerPromise(worker);
    }

    public async getSchema(): Promise<SchemaResponse | string | null> {
        if (this._schemaString) {
            return this._schemaString;
        }
        const langWorker = await (await this.worker)();
        return langWorker.getSchemaResponse();
    }

    public async setSchema(schema: string | GraphQLSchema): Promise<void> {
        let rawSchema = schema as string;

        if (typeof schema !== "string") {
            rawSchema = printSchema(schema, { commentDescriptions: true });
        }

        this._schemaString = rawSchema;
        const langWorker = await (await this.worker)();
        await langWorker.setSchema(rawSchema);
        this.onDidChangeEmitter.fire(this);
    }

    public async parse(graphqlString: string): Promise<DocumentNode> {
        const langWorker = await (await this.worker)();
        return langWorker.doParse(graphqlString);
    }

    public setSchemaConfig(options: SchemaConfig): void {
        this._schemaConfig = options || Object.create(null);
        this.onDidChangeEmitter.fire(this);
    }

    public updateSchemaConfig(options: Partial<SchemaConfig>): void {
        this._schemaConfig = { ...this._schemaConfig, ...options };
        this.onDidChangeEmitter.fire(this);
    }

    public setExternalFragmentDefinitions(externalFragmentDefinitions: string | FragmentDefinitionNode[]) {
        this._externalFragmentDefinitions = externalFragmentDefinitions;
    }

    public setSchemaUri(schemaUri: string): void {
        this.setSchemaConfig({ ...this._schemaConfig, uri: schemaUri });
    }

    public setModeConfiguration(modeConfiguration: ModeConfiguration): void {
        this._modeConfiguration = modeConfiguration || Object.create(null);
        this.onDidChangeEmitter.fire(this);
    }

    public setFormattingOptions(formattingOptions: FormattingOptions): void {
        this._formattingOptions = formattingOptions || Object.create(null);
        this.onDidChangeEmitter.fire(this);
    }
}

export const modeConfigurationDefault: Required<ModeConfiguration> = {
    documentFormattingEdits: true,
    documentRangeFormattingEdits: false,
    completionItems: true,
    hovers: true,
    documentSymbols: false,
    tokens: false,
    colors: false,
    foldingRanges: false,
    diagnostics: true,
    selectionRanges: false,
};

export const schemaDefault: SchemaConfig = {};

export const formattingDefaults: FormattingOptions = {
    prettierConfig: {
        tabWidth: 2,
    }
};
