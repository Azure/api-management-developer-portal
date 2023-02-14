import * as React from "react";
import { IPageService, PageContract } from "@paperbits/common/pages";
import { ViewManager, View } from "@paperbits/common/ui";
import { Query, Operator, Page } from "@paperbits/common/persistence";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";

interface PagesState {
    selectedTab: string,
    pages: PageContract[],
    currentPage: string
}

export class Pages extends React.Component<{}, PagesState> {
    @Resolve("pageService")
    public pageService: IPageService;

    @Resolve
    public router: Router;
    //public viewManager: ViewManager;

    constructor(props) {
        super(props);

        this.state = {
            selectedTab: "pages",
            pages: [],
            currentPage: "/"
        }
    }

    componentDidMount(): void {
        this.loadPages();
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<PagesState>, snapshot?: any): void {
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
            <div className="nav-tabs-wrapper">
                <div className={`nav-tab${this.state.selectedTab === 'pages' ? ' active' : ''}`} onClick={() => this.setState({ selectedTab: 'pages' })}>Pages</div>
                <div className={`nav-tab${this.state.selectedTab === 'pageLayout'  ? ' active' : ''}`} onClick={() => this.setState({ selectedTab: 'pageLayout' })}>Page layout</div>
            </div>    

            {this.state.selectedTab === 'pages' && this.state.pages.map(page => <div onClick={ () => this.setState({ currentPage: page.permalink }) }>{page.title}</div>)}
            {/* {this.state.selectedTab === 'pageLayout' } */}
        </div>
    }
}