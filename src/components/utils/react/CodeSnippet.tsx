import * as React from "react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Button, Tooltip } from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { RepresentationExample } from "../../../models/representationExample";
import { MarkdownProcessor } from "./MarkdownProcessor";

type TCodeSnippetProps = {
    example?: RepresentationExample;
    name?: string;
    content?: string;
    format?: string;
}

export const CodeSnippet = ({ example, name, content, format }: TCodeSnippetProps) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const code = example?.value || content;
    const language = example?.format || format || "json";
    const title = (example?.title || name || "Sample value") + ` (${language})`;
    
    return (
        <div className={"operation-table"}>
            <div className={"operation-table-header"}>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Body1Strong>{title}</Body1Strong>
                    <Tooltip
                        content={isCopied ? "Copied to clipboard!" : "Copy to clipboard"}
                        relationship={"description"}
                        hideDelay={isCopied ? 3000 : 250}
                    >
                        <Button
                            icon={<Copy16Regular />}
                            appearance="transparent"
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                setIsCopied(true);
                            }}
                        />
                    </Tooltip>
                </Stack>
                {example?.description &&
                    <Body1 block className={"operation-description"}>
                        <MarkdownProcessor markdownToDisplay={example.description} />
                    </Body1>
                }                
            </div>
            <div className={"operation-table-body"}>
                <div className={"operation-table-body-row"}>
                    <SyntaxHighlighter children={code} language={language} style={a11yLight} />
                </div>
            </div>
        </div>
    )
}