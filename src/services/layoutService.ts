
import * as Utils from "@paperbits/common/utils";
import { LayoutContract, ILayoutService } from "@paperbits/common/layouts";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";

const layoutsPath = "contentTypes/layout/contentItems";
const documentsPath = "contentTypes/document/contentItems";

export class LayoutService implements ILayoutService {
    constructor(
        private readonly smapiClient: SmapiClient
    ) { }

    public async getLayoutByKey(key: string): Promise<LayoutContract> {
        return await this.smapiClient.get<LayoutContract>(key);
    }

    public async search(pattern: string): Promise<LayoutContract[]> {
        const pageOfLayouts = await this.smapiClient.get<Page<LayoutContract>>(`${layoutsPath}?$orderby=title&$filter=contains(title,'${pattern}')`);
        return pageOfLayouts.value;
    }

    public async deleteLayout(layout: LayoutContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        try {
            await this.smapiClient.delete(layout.contentKey, headers);
        }
        catch (error) {
            console.log(error);
        }

        try {
            await this.smapiClient.delete(layout.key, headers);
        }
        catch (error) {
            console.log(error);
        }
    }

    public async createLayout(title: string, description: string, uriTemplate: string): Promise<LayoutContract> {
        const identifier = Utils.guid();
        const layoutKey = `${layoutsPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const layout: LayoutContract = {
            id: layoutKey,
            title: title,
            description: description,
            permalinkTemplate: uriTemplate,
            contentKey: contentKey
        };

        const template = {
            object: "block",
            nodes: [{
                object: "block",
                type: "page"
            }],
            type: "layout"
        };

        // await this.objectStorage.addObject(layoutKey, layout);
        // await this.objectStorage.addObject(documentKey, template);

        await this.smapiClient.put<LayoutContract>(layoutKey, [], layout);
        await this.smapiClient.put(contentKey, [], template);

        return layout;
    }

    public async updateLayout(layout: LayoutContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(layout.key, headers, layout);
    }

    public async getLayoutByUriTemplate(uriTemplate: string): Promise<LayoutContract> {


        return null;
    }

    private sort(patterns: string[]): string[] {
        const result = [];

        function compare(a, b) {
            if (a.score < b.score) {
                return 1;
            }

            if (a.score > b.score) {
                return -1;
            }

            return 0;
        }

        for (const pattern of patterns) {
            const segments = pattern.split("/").filter(x => !!x);

            let score = 0;

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                let weight;

                if (segment.startsWith("{")) { // variable
                    weight = 2;
                }
                else if (segment === "*") { // wildcard
                    weight = 1;
                }
                else { // constant
                    weight = 3;
                }

                score += weight / (i + 1);
            }

            result.push({ score: score, pattern: pattern });
        }

        return result.sort(compare).map(x => x.pattern);
    }

    private matchPermalink(permalink: string, template: string): any {
        const tokens: { index: number, name: string, value?: string }[] = [];

        const permalinkSegments: string[] = permalink.split("/");
        const templateSegments: string[] = template.split("/");

        if (permalinkSegments.length !== templateSegments.length && template.indexOf("*") === -1) {
            return {
                match: false,
                tokens: tokens
            };
        }

        for (let i = 0; i < templateSegments.length; i++) {
            const permalinkSegment: string = permalinkSegments[i];
            const templateSegment: string = templateSegments[i];

            if (templateSegment === "*") { // wildcard
                if (permalinkSegment !== "" && permalinkSegment !== undefined) {
                    return {
                        match: true,
                        tokens: tokens
                    };
                }
                else {
                    return {
                        match: false,
                        tokens: []
                    };
                }
            }
            else if (templateSegment.startsWith("{")) { // variable
                tokens.push({ index: i, name: templateSegment.replace(/{|}/g, "") });
            }
            else if (permalinkSegment !== templateSegment) { // constant
                return {
                    match: false,
                    tokens: []
                };
            }
        }

        return {
            match: true,
            tokens: tokens
        };
    }

    public async getLayoutByRoute(route: string): Promise<LayoutContract> {
        if (!route) {
            return null;
        }

        const pageOfLayouts = await this.smapiClient.get<Page<LayoutContract>>(layoutsPath);
        const layouts = pageOfLayouts.value;

        if (layouts && layouts.length) {
            let templates = layouts.map(x => x.permalinkTemplate);
            templates = this.sort(templates);

            const matchingTemplate = templates.find(template => {
                return this.matchPermalink(route, template).match;
            });

            return layouts.find(x => x.permalinkTemplate === (matchingTemplate || "/"));
        }
        else {
            return null;
        }
    }


    public async getLayoutContent(layoutKey: string): Promise<Contract> {
        const layout = await this.smapiClient.get<LayoutContract>(layoutKey);
        const document = await this.smapiClient.get<any>(layout.contentKey);
        return document;
    }

    public async updateLayoutContent(layoutKey: string, content: Contract): Promise<void> {
        const layout = await this.smapiClient.get<LayoutContract>(layoutKey);

        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(layout.contentKey, headers, content);
    }
}
