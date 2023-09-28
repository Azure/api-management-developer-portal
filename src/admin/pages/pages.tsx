import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { Query, Operator } from '@paperbits/common/persistence';
import { ViewManager } from '@paperbits/common/ui';
import { Router } from '@paperbits/common/routing';
import { CommandBarButton, FontIcon, IIconProps, Pivot, PivotItem, SearchBox, Stack, Text } from '@fluentui/react';
import { getAllValues } from '../utils/helpers';
import { lightTheme } from '../utils/themes';
import { BackButton } from '../utils/components/backButton';
import { PageDetailsModal } from './pageDetailsModal';
import { PageLayoutDetailsModal } from './pageLayoutDetailsModal';

interface PagesState {
    selectedTab: string,
    pages: PageContract[],
    showPagesModal: boolean,
    selectedPage: PageContract,
    layouts: LayoutContract[],
    showLayoutModal: boolean,
    selectedLayout: LayoutContract
}

interface PagesProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const pageIcon: IIconProps = { iconName: 'Page' };
const layoutIcon: IIconProps = { iconName: 'PageHeaderEdit' };

const iconStyles = { width: '16px', color: lightTheme.palette.themePrimary };

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
            showPagesModal: false,
            selectedPage: null,
            layouts: [],
            showLayoutModal: false,
            selectedLayout: null
        }
    }

    componentDidMount(): void {
        this.searchPages();
        this.searchLayouts();
    }

    handlePageDetailsBackButtonClick = (): void => {
        this.setState({ showPagesModal: false, selectedPage: null });
        this.searchPages();
    }

    handlePageLayoutBackButtonClick = (): void => {
        this.setState({ showLayoutModal: false, selectedLayout: null, selectedTab: 'layouts' });
        this.viewManager.setHost({ name: 'page-host' });
        this.searchLayouts();
    }

    searchPages = async (searchPattern: string = ''): Promise<void> => {
        const query = Query.from().orderBy('title');
        if (searchPattern) {
            query.where('title', Operator.contains, searchPattern);
        }

        const pagesSearchResult = await this.pageService.search(query);
        const allPages = await getAllValues(pagesSearchResult, pagesSearchResult.value);
        this.setState({ pages: allPages });
    }

    searchLayouts = async (searchPattern: string = ''): Promise<void> => {
        const query = Query.from().orderBy('title');
        if (searchPattern) {
            query.where('title', Operator.contains, searchPattern);
        }

        const layoutsSearchResult = await this.layoutService.search(query);
        const allLayouts = await getAllValues(layoutsSearchResult, layoutsSearchResult.value);
        this.setState({ layouts: allLayouts });
    }

    renderPageContent = (page: PageContract): JSX.Element => (
        <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            className="nav-item-outer-stack"
            onClick={async () => await this.router.navigateTo(page.permalink)}
        >
            <Text>{page.title}</Text>
            <FontIcon
                iconName="Settings"
                title="Edit"
                style={iconStyles}
                className="nav-item-inner"
                onClick={(event) => {
                    event.stopPropagation();
                    this.setState({ showPagesModal: true, selectedPage: page })}
                }
            />
        </Stack>
    )

    renderPageLayoutContent = (layout: LayoutContract): JSX.Element => (
        <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            className="nav-item-outer-stack"
            onClick={async () => this.viewManager.setHost({ name: 'layout-host', params: { layoutKey: layout.key } })}
        >
            <Text block nowrap className="nav-item-title">{layout.title}</Text>
            <FontIcon
                iconName="Settings"
                title="Edit"
                style={iconStyles}
                className="nav-item-inner"
                onClick={(event) => {
                    event.stopPropagation();
                    this.setState({ showLayoutModal: true, selectedLayout: layout })}
                }
            />
        </Stack>
    )

    render(): JSX.Element {
        return <>
            {this.state.showPagesModal &&
                <PageDetailsModal
                    page={this.state.selectedPage}
                    onDismiss={this.handlePageDetailsBackButtonClick.bind(this)}
                />
            }
            {this.state.showLayoutModal &&
                <PageLayoutDetailsModal
                    layout={this.state.selectedLayout}
                    onDismiss={this.handlePageLayoutBackButtonClick.bind(this)}
                />
            }
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
                    <CommandBarButton
                        iconProps={addIcon}
                        text="Add page"
                        className="nav-item-list-button"
                        onClick={() => this.setState({ showPagesModal: true, selectedPage: null })}
                    />
                    <SearchBox
                        ariaLabel="Search pages"
                        placeholder="Search pages..."
                        onChange={(event, searchValue) => this.searchPages(searchValue)}
                        styles={{ root: { marginTop: 20 } }}
                    />
                    <div className="objects-list">
                        {this.state.pages.map(page =>
                            <CommandBarButton
                                iconProps={pageIcon}
                                text={page.title}
                                key={page.key}
                                className="nav-item-list-button"
                                onRenderText={() => this.renderPageContent(page)}
                            />
                        )}
                    </div>
                </PivotItem>
                <PivotItem headerText="Layouts" itemKey="layouts">
                    <Stack className="nav-item-description-container">
                        <Text className="description-text">Add or edit layouts. Layouts let you centralize common content (e.g., navigation bar, footer), which will be applied to pages. 
                        Each page is automatically matched with a layout based on the URL template.</Text>
                    </Stack>
                    <CommandBarButton
                        iconProps={addIcon}
                        text="Add layout"
                        className="nav-item-list-button"
                        onClick={() => this.setState({ showLayoutModal: true, selectedLayout: null })}
                    />
                    <SearchBox
                        ariaLabel="Search layouts"
                        placeholder="Search layouts..."
                        onChange={(event, searchValue) => this.searchLayouts(searchValue)}
                        styles={{ root: { marginTop: 20 } }}
                    />
                    <div className="objects-list">
                        {this.state.layouts.map(layout =>
                            <CommandBarButton
                                iconProps={layoutIcon}
                                text={layout.title}
                                key={layout.key}
                                className="nav-item-list-button"
                                onRenderText={() => this.renderPageLayoutContent(layout)}
                            />
                        )}
                    </div>
                </PivotItem>
            </Pivot>
        </>
    }
}