import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { Query, Operator } from '@paperbits/common/persistence';
import { ViewManager } from '@paperbits/common/ui';
import { Router } from '@paperbits/common/routing';
import { Pivot, PivotItem, IIconProps, Stack, Text, SearchBox, ActionButton } from '@fluentui/react';
import { BackButton } from '../utils/components/backButton';
import { PageDetails } from './pageDetails';
import { PageLayoutDetails } from './pageLayoutDetails';

interface PagesState {
    selectedTab: string,
    pages: PageContract[],
    selectedPage: PageContract,
    layouts: LayoutContract[],
    selectedLayout: LayoutContract
}

interface PagesProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const pageIcon: IIconProps = { iconName: 'Page' };
const layoutIcon: IIconProps = { iconName: 'PageHeaderEdit' };

export class Pages extends React.Component<PagesProps, PagesState> {
    @Resolve('pageService')
    public pageService: IPageService;

    @Resolve('layoutService')
    public layoutService: ILayoutService;

    @Resolve('router')
    public router: Router;

    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: PagesProps) {
        super(props);

        this.state = {
            selectedTab: 'pages',
            pages: [],
            selectedPage: null,
            layouts: [],
            selectedLayout: null
        }
    }

    componentDidMount(): void {
        this.searchPages();
        this.searchLayouts();
    }

    handlePageDetailsBackButtonClick = () => {
        this.setState({ selectedPage: null });
        this.searchPages();
    }

    handlePageLayoutBackButtonClick = () => {
        this.setState({ selectedLayout: null, selectedTab: 'pageLayouts' });
        this.viewManager.setHost({ name: 'page-host' });
        this.searchLayouts();
    }

    searchPages = async (searchPattern: string = '') => {
        const query = Query.from().orderBy('title');
        if (searchPattern) {
            query.where('title', Operator.contains, searchPattern);
        }

        const pagesSearchResult = await this.pageService.search(query);
        this.setState({ pages: pagesSearchResult.value })

        return;
    }

    searchLayouts = async (searchPattern: string = '') => {
        const query = Query.from().orderBy('title');
        if (searchPattern) {
            query.where('title', Operator.contains, searchPattern);
        }

        const layoutsSearchResult = await this.layoutService.search(query);
        this.setState({ layouts: layoutsSearchResult.value })

        return;
    }

    handlePageClick = async (page: PageContract, isNewPage: boolean = false) => {
        isNewPage && await this.pageService.createPage(page.permalink, page.title, '', '');
        this.setState({ selectedPage: page });
        await this.router.navigateTo(page.permalink);
    }

    handleLayoutClick = async (layout: LayoutContract, isNewLayout: boolean = false) => {
        let newLayout: LayoutContract = null; 
        if (isNewLayout) newLayout = await this.layoutService.createLayout(layout.title, '', layout.permalinkTemplate);
        this.viewManager.setHost({ name: 'layout-host', params: { layoutKey: newLayout ? newLayout.key : layout.key } });
        this.setState({ selectedLayout: layout });
    }

    render() {
        return <>
            {this.state.selectedPage
                ? <PageDetails
                    page={this.state.selectedPage}
                    onBackButtonClick={this.handlePageDetailsBackButtonClick.bind(this)}
                />
                : this.state.selectedLayout
                    ? <PageLayoutDetails
                        layout={this.state.selectedLayout}
                        onBackButtonClick={this.handlePageLayoutBackButtonClick.bind(this)}
                    />
                    :
                <>
                    <BackButton onClick={this.props.onBackButtonClick} />
                    <Pivot
                        aria-label="Pages tabs"
                        selectedKey={this.state.selectedTab}
                        onLinkClick={(item: PivotItem) => this.setState({ selectedTab: item.props.itemKey })}
                    >
                        <PivotItem headerText="Pages" itemKey="pages">
                            <Stack className="nav-item-description-container">
                                <Text className="description-text">Add or edit pages of your website. Each page has a unique URL, which also automatically defines the layout it is part of.</Text>
                            </Stack>
                            <SearchBox
                                ariaLabel="Search pages"
                                placeholder="Search pages..."
                                onChange={(event, searchValue) => this.searchPages(searchValue)}
                                styles={{ root: { marginTop: 20 } }}
                            />
                            <div className="objects-list">
                                {this.state.pages.map(page =>
                                    <ActionButton
                                        iconProps={pageIcon}
                                        text={page.title}
                                        key={page.key}
                                        onClick={() => this.handlePageClick(page)}
                                        styles={{ root: { display: 'block' } }}
                                    />
                                )}
                            </div>
                            <ActionButton
                                iconProps={addIcon}
                                text="Add page"
                                styles={{ root: { height: 44 } }}
                                onClick={() => this.handlePageClick({ permalink: '/new-page', title: 'New page' }, true)}
                            />
                        </PivotItem>
                        <PivotItem headerText="Page layout" itemKey="pageLayouts">
                            <Stack className="nav-item-description-container">
                                <Text className="description-text">Add or edit layouts. Layouts let you centralize common content (e.g., navigation bar, footer), which will be applied to pages. 
                                Each page is automatically matched with a layout based on the URL template.</Text>
                            </Stack>
                            <SearchBox
                                ariaLabel="Search layouts"
                                placeholder="Search layouts..."
                                onChange={(event, searchValue) => this.searchLayouts(searchValue)}
                                styles={{ root: { marginTop: 20 } }}
                            />
                            <div className="objects-list">
                                {this.state.layouts.map(layout =>
                                    <ActionButton
                                        iconProps={layoutIcon}
                                        text={layout.title}
                                        key={layout.key}
                                        onClick={ () => this.handleLayoutClick(layout) }
                                        styles={{ root: { display: 'block' } }}
                                    />
                                )}
                            </div>
                            <ActionButton
                                iconProps={addIcon}
                                text="Add layout"
                                styles={{ root: { height: 44 } }}
                                onClick={() => this.handleLayoutClick({ permalinkTemplate: '/new-layout', title: 'New layout' }, true)}
                            />
                        </PivotItem>
                    </Pivot>
                </>
            }
        </>
    }
}