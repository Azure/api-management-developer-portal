import * as ko from "knockout";
import template from "./wiki-documentation.html";
import { Component, RuntimeComponent, Param, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { DocumentationService } from "../../../../../../services/documentationService";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { MarkdownService } from "../../../../../../services/markdownService";

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
        private readonly markdownService: MarkdownService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.compiledContent = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        await this.renderDocumentation();
        this.router.addRouteChangeListener(this.onRouteChanged);
    }

    private async onRouteChanged(): Promise<void> {
        await this.renderDocumentation();
    }

    private async renderDocumentation(){
        const documentationId = this.routeHelper.getDocumentationId();
        const markdown = (await this.documentationService.getDocumentation(documentationId)).content;

        if (documentationId) {
            this.compiledContent(this.markdownService.processMarkdown(markdown));
        }
    }
}