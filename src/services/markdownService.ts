import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import * as truncate from "html-truncate";

/**
 * A service to process markdown input.
 */
export class MarkdownService {
    public processMarkdown(markdown: string, length?: number): string {
        let processedHtml: string;

        remark()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(rehypeSanitize, {
                ...defaultSchema,
                attributes: {
                    "*": ["className", "role", "style"],
                    "img": ["src", "alt", "width", "height"],
                    "a": ["href", "target"]
                }
            })
            .use(rehypeStringify)
            .process(markdown, (err: any, html: any) => {
                processedHtml = truncate(html.value, length, { keepImageTag: true });
            });

        return processedHtml;
    }
}