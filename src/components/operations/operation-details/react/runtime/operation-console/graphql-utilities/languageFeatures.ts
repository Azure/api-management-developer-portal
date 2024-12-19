/**
 *  Copyright (c) 2021 GraphQL Contributors.
 *
 *  This source code is licensed under the MIT license found in the
 *  LICENSE file in the root directory of this source tree.
 */


import { GraphQLWorker } from "./graphqlWorker";
import type { LanguageServiceApi } from "./languageServiceApi";

import type {
    Uri,
    Position,
    Thenable,
    CancellationToken,
    IDisposable,
    IRange,
    editor,
    languages
} from "monaco-editor";

import { CompletionItemKind as lsCompletionItemKind } from "vscode-languageserver-types";
import { CompletionItem as GraphQLCompletionItem } from "graphql-language-service";
export type WorkerAccessor = (...more: Uri[]) => Thenable<GraphQLWorker>;

// --- completion ------

export class DiagnosticsAdapter {
    private disposables: IDisposable[] = [];
    private listener: { [uri: string]: IDisposable } = Object.create(null);

    constructor(private worker: WorkerAccessor, private defaults: LanguageServiceApi) {
        const monacoEditorInstance = (<any>window).monaco.editor;

        const onModelAdd = (model: editor.IModel): void => {
            const modeId = model.getModeId();
            if (modeId !== this.defaults.languageId) {
                return;
            }

            let handle: number;
            this.listener[model.uri.toString()] = model.onDidChangeContent(() => {
                clearTimeout(handle);
                // @ts-ignore
                handle = setTimeout(() => this.doValidate(model, modeId), 200);
            });

            this.doValidate(model, modeId);
        };

        const onModelRemoved = (model: editor.IModel): void => {
            monacoEditorInstance.setModelMarkers(model, this.defaults.languageId, []);
            const uriStr = model.uri.toString();
            const listener = this.listener[uriStr];

            if (listener) {
                listener.dispose();
                delete this.listener[uriStr];
            }
        };

        this.disposables.push(monacoEditorInstance.onDidCreateModel(onModelAdd));

        this.disposables.push(
            monacoEditorInstance.onWillDisposeModel(model => {
                onModelRemoved(model);
            }),
        );

        this.disposables.push(
            monacoEditorInstance.onDidChangeModelLanguage(event => {
                onModelRemoved(event.model);
                onModelAdd(event.model);
            }),
        );

        this.disposables.push(
            defaults.onDidChange((_: any) => {
                monacoEditorInstance.getModels().forEach(model => {
                    if (model.getModeId() === this.defaults.languageId) {
                        onModelRemoved(model);
                        onModelAdd(model);
                    }
                });
            }),
        );

        this.disposables.push({
            dispose: () => {
                for (const key in this.listener) {
                    this.listener[key].dispose();
                }
            }
        });

        monacoEditorInstance.getModels().forEach(onModelAdd);
    }

    public dispose(): void {
        this.disposables.forEach(d => d && d.dispose());
        this.disposables = [];
    }

    private async doValidate(model: editor.IReadOnlyModel, languageId: string) {
        const worker = await this.worker(null);
        const diagnostics = await worker.doValidation(model);

        (<any>window).monaco.editor.setModelMarkers(model, languageId, diagnostics);
    }
}

const mKind = (<any>window).monaco.languages.CompletionItemKind;

export function toCompletionItemKind(kind: lsCompletionItemKind) {
    switch (kind) {
        case lsCompletionItemKind.Text:
            return mKind.Text;
        case lsCompletionItemKind.Method:
            return mKind.Method;
        case lsCompletionItemKind.Function:
            return mKind.Function;
        case lsCompletionItemKind.Constructor:
            return mKind.Constructor;
        case lsCompletionItemKind.Field:
            return mKind.Field;
        case lsCompletionItemKind.Variable:
            return mKind.Variable;
        case lsCompletionItemKind.Class:
            return mKind.Class;
        case lsCompletionItemKind.Interface:
            return mKind.Interface;
        case lsCompletionItemKind.Module:
            return mKind.Module;
        case lsCompletionItemKind.Property:
            return mKind.Property;
        case lsCompletionItemKind.Unit:
            return mKind.Unit;
        case lsCompletionItemKind.Value:
            return mKind.Value;
        case lsCompletionItemKind.Enum:
            return mKind.Enum;
        case lsCompletionItemKind.Keyword:
            return mKind.Keyword;
        case lsCompletionItemKind.Snippet:
            return mKind.Snippet;
        case lsCompletionItemKind.Color:
            return mKind.Color;
        case lsCompletionItemKind.File:
            return mKind.File;
        case lsCompletionItemKind.Reference:
            return mKind.Reference;
        case lsCompletionItemKind.Folder:
            return mKind.Folder;
        case lsCompletionItemKind.EnumMember:
            return mKind.EnumMember;
        case lsCompletionItemKind.Constant:
            return mKind.Constant;
        case lsCompletionItemKind.Struct:
            return mKind.Struct;
        case lsCompletionItemKind.Event:
            return mKind.Event;
        case lsCompletionItemKind.Operator:
            return mKind.Operator;
        case lsCompletionItemKind.TypeParameter:
            return mKind.TypeParameter;
        default:
            return mKind.Text;
    }
}

export function toCompletion(entry: GraphQLCompletionItem & { range: IRange }): languages.CompletionItem {
    return {
        label: entry.label,
        insertText: entry.insertText || (entry.label as string),
        sortText: entry.sortText,
        filterText: entry.filterText,
        documentation: entry.documentation,
        detail: entry.detail,
        range: entry.range,
        kind: toCompletionItemKind(entry.kind as lsCompletionItemKind),
    };
}

export class CompletionAdapter implements languages.CompletionItemProvider {
    constructor(private worker: WorkerAccessor) { }

    public get triggerCharacters(): string[] {
        return [" ", ":"];
    }

    public async provideCompletionItems(model: editor.IReadOnlyModel, position: Position): Promise<languages.CompletionList> {
        try {
            const worker = await this.worker(model.uri);

            const completionItems = await worker.doComplete(
                model,
                position,
            );

            return {
                incomplete: true,
                suggestions: completionItems.map(toCompletion),
            };
        }
        catch (err) {
            console.error(`Error fetching completion items\n\n${err}`);
            return { suggestions: [] };
        }
    }
}

export class DocumentFormattingAdapter implements languages.DocumentFormattingEditProvider {
    constructor(private worker: WorkerAccessor) { }

    public async provideDocumentFormattingEdits(document: editor.ITextModel) {
        const worker = await this.worker(document.uri);
        const text = document.getValue();

        const formatted = await worker.doFormat(text);
        return [
            {
                range: document.getFullModelRange(),
                text: formatted,
            },
        ];
    }
}

export class HoverAdapter implements languages.HoverProvider {
    constructor(private worker: WorkerAccessor) { }

    public async provideHover(model: editor.IReadOnlyModel, position: Position, _token: CancellationToken): Promise<languages.Hover> {
        const worker = await this.worker(model.uri);
        const hoverItem = await worker.doHover(model, position);

        if (hoverItem) {
            return <languages.Hover>{
                range: hoverItem.range,
                contents: [{ value: hoverItem.content }],
            };
        }

        // @ts-ignore
        return;
    }

    public dispose() {
        // do nothing
    }
}
