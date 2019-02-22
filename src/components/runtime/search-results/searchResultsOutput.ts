import * as lunr from "lunr";
import template from "./searchResultsOutput.html";
import { XmlHttpRequestClient } from "@paperbits/common/http";
import { RuntimeComponent } from "@paperbits/common/ko/decorators";


export interface SearchResult {
    title: string;
    fragment: string;
    url: string;
}


@RuntimeComponent({
    selector: "search-results-output",
    template: template
})
export class SearchResultOutput {
    public pattern: ko.Observable<string>;
    public results: ko.ObservableArray<SearchResult>;

    private searchTimeout: any;
    private idexer: any;

    private getUrlParameter(name: string): string {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

        const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        const results = regex.exec(location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    constructor(params) {
        const searchString = this.getUrlParameter("q");

        this.pattern = ko.observable(searchString);
        this.pattern.subscribe(() => {
            clearTimeout(this.searchTimeout);

            this.searchTimeout = setTimeout(() => {
                this.doSearch();
            }, 500);
        });

        this.results = ko.observableArray([]);

        this.loadIndex();
    }

    private async loadIndex(): Promise<void> {
        const httpClient = new XmlHttpRequestClient();

        try {
            const response = await httpClient.send({ url: "/search-index.json", method: "GET" })
            const indexData = response.toObject();

            this.idexer = lunr.Index.load(indexData);

            if (this.pattern()) {
                this.doSearch();
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    private doSearch(): void {
        this.results([]);
        
        const searchRawResults = this.idexer.search(this.pattern()+"*");

        searchRawResults.slice(0, 5).forEach(async result => {
            const searchTerm = Object.keys(result.matchData.metadata)[0];
            const searchResult = await this.fetchResults(searchTerm, result.ref);

            this.results.push(searchResult);
        })
    }

    private async fetchResults(term: string, url: string): Promise<SearchResult> {
        const httpClient = new XmlHttpRequestClient();

        const response = await httpClient.send({
            url: url,
            method: "GET"
        })

        const text = response.toText();
        const el = document.createElement("div");
        el.innerHTML = text;

        const titleElement = el.querySelector("title");
        const title = titleElement.innerText.split("|")[0].trim();
        const bodyElement = el.querySelector("main");
        const body = bodyElement.textContent.replace(/<[^>]+>/ig, " ").replace(/\s{2,}/gm, " ");

        const fragmentSize = 150;

        const index = body.toLowerCase().indexOf(term.toLowerCase());
        let startIndex = index - Math.floor(fragmentSize / 2);

        if (startIndex < 0) {
            startIndex = 0;
        }

        const fragment = `...${body.substring(startIndex, startIndex + fragmentSize)}...`;

        return {
            title: title,
            fragment: fragment,
            url: url
        }
    }
}