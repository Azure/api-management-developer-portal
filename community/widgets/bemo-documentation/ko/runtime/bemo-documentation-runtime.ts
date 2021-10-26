import * as ko from "knockout";
import template from "./bemo-documentation-runtime.html";
import { Component, RuntimeComponent, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { widgetRuntimeSelector } from "../..";
import { RouteHelper } from "../../../../../src/routing/routeHelper";
import { GithubService } from "../../../../../src/services/githubService";
import { GithubType, StoredDocumentation } from "../../../../../src/constants";
import { Menu } from "../../../../../src/models/menu";
import { MenuItem } from "../../../../../src/models/menuItem";

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
    public structure: ko.Observable<Menu>;

    constructor(private readonly routeHelper: RouteHelper, private readonly githubService: GithubService) {
        this.api = ko.observable();
        this.sessionDescription = ko.observable();
        this.structure = ko.observable<Menu>();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        const fileName = this.routeHelper.getHashParameter("fileName");
        const api = this.routeHelper.getApiName();
        const storedStructure = localStorage.getItem(StoredDocumentation);

        if (storedStructure) {
            // Structure from localStorage
            this.structure(JSON.parse(storedStructure));
        } else {
            // No stored Github repository structure, get structure from Github API
            const response = await this.githubService.getRepositoryTree();

            if (response.status === 200) {
                const repoStructure = this.getRepositoryStructure(response.data['tree']);

                if (repoStructure !== null) {
                    this.structure(repoStructure);
                    localStorage.setItem(StoredDocumentation, JSON.stringify(repoStructure));
                }
            }
        }

        this.api(api);
    }

    public getRepositoryStructure(data) {
        const navMenu = new Menu();

        data.forEach(datum => {
            const pathSplitted = datum['path'].split('/');
            let datumPath = pathSplitted.length > 1 ? datum['path'].replace(pathSplitted[pathSplitted.length - 1], '').substring(0, datum['path'].replace(pathSplitted[pathSplitted.length - 1], '').length - 1) : datum['path'];
            const menu = this.searchMenu(navMenu, datumPath);

            if (datum['type'] === GithubType.blob) {
                if (menu === undefined || pathSplitted.length === 1) {
                    navMenu.menuItems.push(new MenuItem(datum['path'], datum['url']));
                } else {
                    menu.menuItems.push(new MenuItem(datum['path'], datum['url']));
                }
            }
            else if (datum['type'] === GithubType.tree) {
                if (menu === undefined || pathSplitted.length === 1) {
                    navMenu.menus.push(new Menu(datum['path']));
                } else {
                    menu.menus.push(new Menu(datum['path']));
                }
            }
        });

        return navMenu;
    }

    public searchMenu(element, matchingPath) {
        if (element.path == matchingPath) {
            return element;
        } else if (element.menus !== null) {
            let result = null;

            for (let i = 0; result == null && i < element.menus.length; i++) {
                result = this.searchMenu(element.menus[i], matchingPath);
            }

            return result;
        }
        return null;
    }
}