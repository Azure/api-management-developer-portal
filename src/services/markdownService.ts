import * as ko from "knockout";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import * as truncateHtml from "truncate-html";

/**
 * A service to process markdown input.
 */
export class MarkdownService {
    public processMarkdown(markdown: string): string {
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
                processedHtml = truncateHtml.default(html, { length: length, reserveLastWord: true });
            });

        return processedHtml;
    }
}