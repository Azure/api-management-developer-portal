
import * as ko from "knockout";
import template from "./bemo-documentation-runtime.html";
import { Component, RuntimeComponent, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../..";
import { RouteHelper } from "../../../../../src/routing/routeHelper";
import { GithubService } from "../../../../../src/services/githubService";
import { GithubFile } from "../../../../../src/models/githubFile";
import { cpuUsage } from "process";

@RuntimeComponent({
    selector: widgetRuntimeSelector
})
@Component({
    selector: widgetRuntimeSelector,
    template: template
})
export class BemoDocumentationRuntime {
    @Param()
    public readonly fileName: ko.Observable<string>;
    public readonly api: ko.Observable<string>;

    public readonly sessionDescription: ko.Observable<string>;
    public readonly repoStructure: ko.ObservableArray<GithubFile>;

    constructor(private readonly routeHelper: RouteHelper, private readonly githubService: GithubService) {
        this.api = ko.observable();
        this.repoStructure = ko.observableArray();
        this.sessionDescription = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const fileName = this.routeHelper.getHashParameter("fileName");
        const api = this.routeHelper.getApiName();
        await this.githubService.getRepositoryStructure().then(resp => {
            this.repoStructure(resp);
        });
        
        this.api(api);
    }
}