import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import * as truncateHtml from "truncate-html";
import * as ko from "knockout";
import template from "./wiki-documentation.html";
import { Component, RuntimeComponent, Param, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { DocumentationService } from "../../../../../../services/documentationService";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../../routing/routeHelper";

@RuntimeComponent({
    selector: "wiki-documentation"
})
@Component({
    selector: "wiki-documentation",
    template: template
})

export class WikiDocumentation {
    public compiledContent: ko.Observable<string>;

    constructor(
        private readonly documentationService: DocumentationService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.compiledContent = ko.observable();


    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const documentationId = this.routeHelper.getDocumentationId();

        if (documentationId) {
            this.compiledContent(await this.processMarkdown(documentationId));
        }
        
        this.router.addRouteChangeListener(this.onRouteChanged);
    }

    private async onRouteChanged(): Promise<void> {
        const documentationId = this.routeHelper.getDocumentationId();

        if (documentationId) {
            this.compiledContent(await this.processMarkdown(documentationId));
        }
    }

    private async processMarkdown(documentationId: string, length?: number): Promise<string> {
        const markdown = (await this.documentationService.getDocumentation(documentationId)).content;
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