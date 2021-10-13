/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import type { editor, IDisposable } from "monaco-editor";
import { LanguageServiceApi } from "./languageServiceApi";
import { GraphQLWorker } from "./graphqlWorker";
import { ICreateData } from "./typings";

const STOP_WHEN_IDLE_FOR = 2 * 60 * 1000; // 2min

export class WorkerManager {
    private idleCheckInterval: number;
    private lastUsedTime: number;
    private configChangeListener: IDisposable;
    private worker: editor.MonacoWebWorker<GraphQLWorker> | null;

    constructor(private defaults: LanguageServiceApi) {
        this.worker = null;
        this.idleCheckInterval = (setInterval(
            () => this.checkIfIdle(),
            30 * 1000,
        ) as unknown) as number;
        this.lastUsedTime = 0;
        this.configChangeListener = this.defaults.onDidChange(() =>
            this.stopWorker(),
        );
    }

    private stopWorker(): void {
        if (this.worker) {
            this.worker.dispose();
            this.worker = null;
        }
    }

    public dispose(): void {
        clearInterval(this.idleCheckInterval);
        this.configChangeListener.dispose();
        this.stopWorker();
    }

    private checkIfIdle(): void {
        if (!this.worker) {
            return;
        }
        const timePassedSinceLastUsed = Date.now() - this.lastUsedTime;
        if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
            this.stopWorker();
        }
    }

    public async getLanguageServiceWorker(): Promise<GraphQLWorker> {
        return new GraphQLWorker({
            languageId: this.defaults.languageId,
            formattingOptions: this.defaults.formattingOptions,
            languageConfig: {
                schemaString: this.defaults.schemaString,
                schemaConfig: this.defaults.schemaConfig,
                exteralFragmentDefinitions: this.defaults.externalFragmentDefinitions
            },
        } as ICreateData);
    }
}
