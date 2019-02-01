import * as ko from "knockout";
import template from "./api-list.html";
import { SearchRequest } from "./searchRequest";
import { TreeViewNode } from "./treeviewNode";
import { VersionSetContract } from "../../../contracts/apiVersionSet";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";
import { TagContract } from "../../../contracts/tag";
import { Utils } from "../../../utils";
import { TagService } from "../../../services/tagService";
import { ApiService } from "../../../services/apiService";
import { Component } from "@paperbits/common/ko/decorators";
import { DefaultRouteHandler } from "@paperbits/common/routing";
import { Api } from "../../../models/api";

@RuntimeComponent({ selector: "api-list" })
@Component({
    selector: "api-list",
    template: template,
    injectable: "apiList"
})
export class ApiList {
    private searchRequest: SearchRequest;
    public nodes: KnockoutObservableArray<TreeViewNode>;
    public selectedNodeId: KnockoutObservable<string>;

    // @Observable()
    public selectedNode: KnockoutObservable<TreeViewNode>;
    public selectedVersionSet: VersionSetContract;
    public selection: TagContract[];
    public grouping: string;
    public tags: TagContract[];

    constructor(
        private readonly apiService: ApiService,
        private readonly tagService: TagService,
        // private readonly hostService: HostService,
        // private readonly routingService: RoutingService
        private readonly routeHandler: DefaultRouteHandler
    ) {
        this.nodes = ko.observableArray([]);
        this.tags = [];
        this.selection = [];
        this.grouping = "none";

        this.selectedNode = ko.observable();

        this.searchApis();
    }

    // private async loadTags(): Promise<void> {
    //     const pageOfTags = await this.tagService.getTags("apis");
    //     this.tags = pageOfTags.value;
    // }

    // public async ngOnInit(): Promise<void> {
    //     this.searchApis();
    // }

    // public groupByTag(): void {
    //     this.grouping = "tag";
    //     this.searchApis();
    // }

    // public groupByNone(): void {
    //     this.grouping = "none";
    //     this.searchApis();
    // }

    // private tagResourcesToNodes(pairs: TagResourceContract[]): void {
    //     const tagNodes = [];
    //     const tagDictionary = {};
    //     const versionSetDictionary = {};

    //     pairs.forEach(pair => {
    //         if (!pair.api.isCurrent) {
    //             return;
    //         }

    //         let tagNode: TreeViewNode;
    //         const tagName = pair.tag ? pair.tag.name : "Not tagged";

    //         tagNode = tagDictionary[tagName];

    //         if (!tagNode) {
    //             tagNode = new TreeViewNode(tagName);
    //             tagNode.id = tagName;
    //             tagNode.level = 0;
    //             tagNode.isSelected = () => tagNode.id === this.selectedNodeId;
    //             tagNode.onSelect = () => this.selectedNodeId = tagNode.id;
    //             tagDictionary[tagName] = tagNode;
    //             tagNodes.push(tagNode);

    //         }

    //         if (pair.api.apiVersionSet) {
    //             const versionSetKey = `${tagName}|${pair.api.apiVersionSet.name}`;
    //             let versionSetNode = versionSetDictionary[versionSetKey];

    //             if (!versionSetNode) {
    //                 versionSetNode = new TreeViewNode(pair.api.apiVersionSet.name);
    //                 versionSetNode.data = pair.api.apiVersionSet;
    //                 versionSetNode.id = Utils.getResourceName("api-version-sets", versionSetNode.data.id, "shortId");
    //                 versionSetNode.isSelected = () => versionSetNode.id === this.selectedNodeId;
    //                 versionSetNode.onSelect = () => this.selectVersionSet(versionSetNode.data, true);
    //                 versionSetNode.level = 1;

    //                 versionSetDictionary[versionSetKey] = versionSetNode;
    //                 tagNode.nodes.push(versionSetNode);
    //             }

    //             const versionNode = new TreeViewNode(pair.api.apiVersion || "Original");
    //             versionNode.data = pair.api;
    //             versionNode.id = Utils.getResourceName("apis", versionNode.data.id, "shortId");
    //             versionNode.onSelect = () => this.selectApi(versionNode);
    //             versionNode.isSelected = () => versionNode.id === this.selectedNodeId;
    //             versionNode.level = 2;
    //             versionSetNode.nodes.push(versionNode);
    //         }
    //         else {
    //             const versionNode = new TreeViewNode(pair.api.name);
    //             versionNode.data = pair.api;
    //             versionNode.id = Utils.getResourceName("apis", versionNode.data.id, "shortId");
    //             versionNode.onSelect = () => this.selectApi(versionNode);
    //             versionNode.isSelected = () => versionNode.id === this.selectedNodeId;
    //             versionNode.level = 1;
    //             tagNode.nodes.push(versionNode);
    //         }
    //     });

    //     this.nodes = tagNodes;
    // }

    private apisToNodes(apis: Api[]): void {
        apis = apis.filter(x => x.isCurrent);

        let apiModels = [];

        const unversionedApis = apis.filter(x => !x.apiVersionSet);
        const unversionedModels = unversionedApis.map(api => {
            const node = new TreeViewNode(api.name);
            const apiShortId = Utils.getResourceName("apis", api.id, "shortId");
            node.data(api);
            node.id = Utils.getResourceName("apis", node.data().id, "shortId");
            node.expanded(false);
            node.isSelected = ko.computed(() => node === this.selectedNode());
            node.onSelect = () => {
                this.selectedNode(node);
                this.routeHandler.navigateTo(apiShortId); // TODO: It might no match the route
            };
            node.level("level-1");

            return node;
        });

        apiModels = apiModels.concat(unversionedModels);

        const versionedApis = apis.filter(x => x.apiVersionSet !== null && x.apiVersionSet !== undefined);

        const groups = Utils.groupBy(versionedApis, x => x.apiVersionSet.id);

        const versionedModels = groups.map(group => {
            const api = group[0];
            const versionSetNode = new TreeViewNode(api.apiVersionSet.name);
            const versionSetShortId = Utils.getResourceName("api-version-sets", api.apiVersionSet.id, "shortId");
            versionSetNode.data(api);
            // versionSetNode.id = versionSetShortId;
            versionSetNode.expanded(false);
            versionSetNode.isSelected = ko.computed(() => versionSetNode === this.selectedNode());
            versionSetNode.onSelect = () => {
                // Do nothing for now
                // this.selectVersionSet(versionSetNode.data.apiVersionSet, true);
            };
            versionSetNode.level("level-1");

            if (versionSetNode.isSelected()) {
                this.selectedNode(versionSetNode);
            }

            versionSetNode.nodes(group.map((groupItem: Api) => {
                const versionNode = new TreeViewNode(groupItem.apiVersion || "Original");
                const apiShortId = Utils.getResourceName("apis", groupItem.id, "shortId");
                versionNode.data(groupItem);
                versionNode.id = apiShortId;
                versionNode.onSelect = () => {
                    this.routeHandler.navigateTo(apiShortId); // TODO: It might no match the route
                    this.selectedNode(versionNode);
                };
                versionNode.isSelected = ko.computed(() => versionNode === this.selectedNode());
                versionNode.level("level-1");

                if (versionNode.isSelected()) {
                    this.selectedNode(versionNode);
                    versionSetNode.expanded(true);
                }

                return versionNode;
            }));

            return versionSetNode;
        });

        apiModels = apiModels.concat(versionedModels);

        this.nodes(apiModels);
    }

    public async searchApis(searchRequest?: SearchRequest): Promise<void> {
        this.searchRequest = searchRequest || this.searchRequest || { pattern: "", tags: [], grouping: "none" };

        switch (this.searchRequest.grouping) {
            case "none":
                const pageOfApis = await this.apiService.getApis(searchRequest);
                const apis = pageOfApis ? pageOfApis.value : [];
                this.apisToNodes(apis);

                break;

            case "tag":
                const pageOfTagResources = await this.apiService.getApisByTags(searchRequest);
                const tagResources = pageOfTagResources ? pageOfTagResources.value : [];
                // TODO: this.tagResourcesToNodes(tagResources);

                break;

            default:
                throw new Error("Unexpected groupBy value");
        }

        // TODO: await this.loadTags();
    }
}