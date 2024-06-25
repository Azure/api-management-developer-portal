import * as React from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeTruncate from "rehype-truncate";
import ReactMarkdown from "react-markdown"; // TODO: upgrade this package and all related ones when https://github.com/hashicorp/next-mdx-remote/issues/403 fixed

type TMarkdownProcessorProps = {
    markdownToDisplay: string;
    maxChars?: number;
}

export const MarkdownProcessor = ({ markdownToDisplay, maxChars }: TMarkdownProcessorProps) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeTruncate, { maxChars, disable: typeof maxChars === "undefined"}]]}
    >
        {markdownToDisplay}
    </ReactMarkdown>
);