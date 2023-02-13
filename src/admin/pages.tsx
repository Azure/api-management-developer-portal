import * as React from "react";
import { IPageService, PageContract } from "@paperbits/common/pages";
import { ViewManager, View } from "@paperbits/common/ui";
import { Query, Operator, Page } from "@paperbits/common/persistence";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";


export class Pages extends React.Component<{}, { pages: PageContract[], currentPage: string }> {
    @Resolve("pageService")
    public pageService: IPageService;

    @Resolve
    public router: Router;
    //public viewManager: ViewManager;

    constructor(props) {
        super(props);

        this.state = {
            pages: [],
            currentPage: '/'
        }
    }

    componentDidMount(): void {
        this.loadPages()
        //his.setState({ pages: this.loadPages() })
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{ pages: PageContract[]; currentPage: string; }>, snapshot?: any): void {
        if (prevState.currentPage !== this.state.currentPage) {
            this.router.navigateTo(this.state.currentPage)
        }
    }

    loadPages = async () => {
        const query = Query.from().orderBy("title");
        const pagesSearchResult = await this.pageService.search(query);
        this.setState({ pages: pagesSearchResult.value })

        return;
    }

    navigateToPage = async (link) => {
        console.log(link);
        return await this.router.navigateTo(link)
    }

    render() {
        return <div>
            {this.state.pages.map(page => <div onClick={ () => this.setState({ currentPage: page.permalink }) }>{page.title}</div>)}
        </div>
    }
}