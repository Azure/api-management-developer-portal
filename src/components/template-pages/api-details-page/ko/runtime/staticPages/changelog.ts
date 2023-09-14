import * as ko from "knockout"
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import template from "./changelog.html";
import { Router } from "@paperbits/common/routing";
import { ApiService } from "../../../../../../services/apiService";
import { RouteHelper } from "../../../../../../routing/routeHelper";
import { ApiChangeLog } from "../../../../../../models/apiChangelog";

@Component({
    selector: "changelog",
    template: template
})
export class Changelog {
    public readonly selectedApiName: ko.Observable<string>;
    public readonly changelogs: ko.Observable<{ [key: string]: ApiChangeLog[] }>;
    public readonly nextLink: ko.Observable<string>;
    public readonly working: ko.Observable<boolean>;
    public readonly moreChangelogsLoading: ko.Observable<boolean>;
    public readonly lastModifiedDate: ko.Observable<string>;

    private ignoreNextScrollEvent: boolean = false;

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router,
        private readonly routeHelper: RouteHelper
    ) {
        this.selectedApiName = ko.observable();
        this.changelogs = ko.observable();
        this.nextLink = ko.observable();
        this.working = ko.observable();
        this.moreChangelogsLoading = ko.observable();
        this.lastModifiedDate = ko.observable();
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);

        const apiName = this.routeHelper.getApiName();

        if (apiName) {
            this.selectedApiName(apiName);
        }

        this.router.addRouteChangeListener(this.onRouteChange);

        const changeLog = await this.apiService.getApiChangeLog(`/apis/${apiName}`, 0);
        const dictionary: { [key: string]: ApiChangeLog[] } = {};

        changeLog.value.forEach(entity => {
            const createdDateTime = entity.createdDateTime;
            if (createdDateTime) {
                const date = new Date(createdDateTime);
                const monthYear = `${this.getMonthName(date)} ${date.getFullYear()}`;
                if (!dictionary[monthYear]) {
                    dictionary[monthYear] = [];
                }
                dictionary[monthYear].push(entity);
            }
        });

        this.changelogs(dictionary);
        this.nextLink(changeLog.nextLink);

        this.lastModifiedDate(new Date(changeLog.value[0]?.createdDateTime).toLocaleDateString());

        window.addEventListener("scroll", () => {
            if (this.ignoreNextScrollEvent) {
                return;
            }
            let isItemSelected = false;
            const changelogItems = document.querySelectorAll(".changelog-item");

            changelogItems.forEach(changlogitem => {
                if (changlogitem instanceof HTMLElement) {
                    const menuItemTop = changlogitem.getBoundingClientRect().top;
                    const menuItemBottom = changlogitem.getBoundingClientRect().bottom;

                    const menuItem = document.getElementById("menu-" + changlogitem.id);
                    if (menuItemTop >= 0 && menuItemBottom <= window.innerHeight && !isItemSelected) {
                        menuItem.classList.add("selected");
                        isItemSelected = true;
                    } else {
                        menuItem.classList.remove("selected");
                    }
                }
            });

        });

        this.working(false);
    }

    public scrollToDate(item: ApiChangeLog): void {
        this.ignoreNextScrollEvent = true;

        const element = document.getElementById(item.createdDateTime);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }

        const elementToSelect = document.getElementById("menu-" + item.createdDateTime);
        if (elementToSelect) {

            const menuItems = document.querySelectorAll(".menu-item");

            menuItems.forEach(menuItem => {
                menuItem.classList.remove("selected");
            });
            elementToSelect.classList.add("selected");
        }

        setTimeout(() => {
            this.ignoreNextScrollEvent = false;
        }, 1000);

    }

    private onRouteChange(): void {
        const apiName = this.routeHelper.getApiName();

        if (apiName) {
            this.selectedApiName(apiName);
        }
    }

    public async loadMoreChangelogs(): Promise<void> {
        this.moreChangelogsLoading(true);
        this.apiService.getMoreApiChangelogs(this.nextLink());

        const changeLog = await this.apiService.getMoreApiChangelogs(this.nextLink());
        const dictionary = this.changelogs();

        changeLog.value.forEach(entity => {
            const createdDateTime = entity.createdDateTime;
            if (createdDateTime) {
                const date = new Date(createdDateTime);
                const monthYear = `${this.getMonthName(date)} ${date.getFullYear()}`;
                if (!dictionary[monthYear]) {
                    dictionary[monthYear] = [];
                }
                dictionary[monthYear].push(entity);
            }
        });

        this.changelogs(dictionary);
        this.nextLink(changeLog.nextLink);

        this.moreChangelogsLoading(false);
    }

    private getMonthName(date: Date): string {
        const monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        return monthNames[date.getMonth()];
    }
}