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
    public readonly compiledContent: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly documentationService: DocumentationService,
        private readonly markdownService: MarkdownService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.compiledContent = ko.observable();
        this.working = ko.observable();
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
        this.working(true);

        const documentationId = this.routeHelper.getDocumentationId();
       
        if (documentationId) {
            const markdown = (await this.documentationService.getDocumentation(documentationId)).content;
            this.compiledContent(this.markdownService.processMarkdown(markdown));
        }

        this.working(false);
    }
}