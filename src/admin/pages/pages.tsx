import * as React from 'react';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { Query, Operator } from '@paperbits/common/persistence';
import { ViewManager } from '@paperbits/common/ui';
import { Router } from '@paperbits/common/routing';
import { Resolve } from '@paperbits/react/decorators';
import { Pivot, PivotItem, IIconProps } from '@fluentui/react';
import { ActionButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
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
const searchIcon: IIconProps = { iconName: 'Search' };

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
                        <PivotItem headerText="Pages" itemKey='pages'>
                            <TextField
                                ariaLabel="Search pages"
                                placeholder="Search pages..."
                                iconProps={searchIcon}
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
                        <PivotItem headerText="Page layout" itemKey='pageLayouts'>
                            <TextField
                                ariaLabel="Search layouts"
                                placeholder="Search layouts..."
                                iconProps={searchIcon}
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