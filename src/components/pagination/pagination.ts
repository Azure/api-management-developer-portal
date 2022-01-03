import * as ko from "knockout";
import * as Constants from "../../constants";
import template from "./pagination.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";

@Component({
    selector: "pagination",
    template: template
})
export class Pagination {
    public readonly canGoPrevPage: ko.Computed<boolean>;
    public readonly canGoFirstPage: ko.Computed<boolean>;
    public readonly canGoNextPage: ko.Computed<boolean>;
    public readonly canGoLastPage: ko.Computed<boolean>;
    public readonly pageNumbers: ko.Observable<number[]>;

    constructor() {
        this.pageNumber = ko.observable(1);
        this.totalPages = ko.observable();
        this.canGoPrevPage = ko.computed(() => this.totalPages() > 0 && this.pageNumber() > Constants.firstPage);
        this.canGoFirstPage = ko.computed(() => this.totalPages() > 0 && this.pageNumber() > Constants.firstPage);
        this.canGoNextPage = ko.computed(() => this.totalPages() > this.pageNumber());
        this.canGoLastPage = ko.computed(() => this.totalPages() > this.pageNumber());
        this.pageNumbers = ko.observable([]);
    }

    @Param()
    public pageNumber: ko.Observable<number>;

    @Param()
    public totalPages: ko.Observable<number>;

    public onPageChange: (pageNumber: number) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.updatePageNumbers();
    }

    public updatePageNumbers(): void {
        const totalPages = this.totalPages();
        const pageNumber = this.pageNumber();

        let lowerLimit = pageNumber - Math.ceil(Constants.showMaximumPages / 2);

        if (lowerLimit < Constants.firstPage) {
            lowerLimit = Constants.firstPage;
        }

        let upperLimit = lowerLimit + Constants.showMaximumPages;

        if (upperLimit > totalPages) {
            upperLimit = totalPages;
        }

        const pageNumbers = [];

        for (let i = lowerLimit; i <= upperLimit; i++) {
            pageNumbers.push(i);
        }

        this.pageNumbers(pageNumbers);
    }

    public goToPage(page: number): void {
        this.pageNumber(page);
        this.updatePageNumbers();

        if (this.onPageChange) {
            this.onPageChange(page);
        }
    }

    public goToFirst(): void {
        this.goToPage(Constants.firstPage);
    }

    public goToPrevious(): void {
        this.goToPage(this.pageNumber() - 1);
    }

    public goToNext(): void {
        this.goToPage(this.pageNumber() + 1);
    }

    public goToLast(): void {
        this.goToPage(this.totalPages());
    }
}