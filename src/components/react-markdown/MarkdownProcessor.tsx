import * as React from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown"; // TODO: upgrade this package and all related ones when https://github.com/hashicorp/next-mdx-remote/issues/403 fixed

export const MarkdownProcessor = ({ markdownToDisplay }: { markdownToDisplay: string }) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{markdownToDisplay}</ReactMarkdown>
);