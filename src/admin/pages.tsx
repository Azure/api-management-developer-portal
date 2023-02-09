import * as React from "react";
import { IPageService } from "@paperbits/common/pages";
import { Query, Operator, Page } from "@paperbits/common/persistence";
import { Resolve } from "@paperbits/react/decorators"


export class Pages extends React.Component<{}, {}> {
    @Resolve("pageService")
    public pageService: IPageService;

    constructor(props) {
        super(props);
    }

    loadPages = async () => {
        const query = Query.from().orderBy("title");
        const pagesSearchResult = await this.pageService.search(query);
        console.log(pagesSearchResult);
    }

    render() {
        return <button onClick={this.loadPages}>Load pages</button>
    }
}