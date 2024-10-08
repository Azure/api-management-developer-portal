import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IUrlService, UrlContract } from '@paperbits/common/urls';
import { ViewManager } from '@paperbits/common/ui';
import { CommandBarButton, FontIcon, IIconProps, SearchBox, Spinner, Stack, Text } from '@fluentui/react';
import { createSearchQuery, getAllValues } from '../utils/helpers';
import { lightTheme } from '../utils/themes';
import { BackButton } from '../utils/components/backButton';
import { UrlDetailsModal } from './urlDetailsModal';

interface UrlsState {
    urls: UrlContract[],
    showUrlDetailsModal: boolean,
    selectedUrl: UrlContract,
    isLoading: boolean
}

interface UrlsProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const linkIcon: IIconProps = { iconName: 'Link' };

const iconStyles = { width: '16px', color: lightTheme.palette.themePrimary };

export class Urls extends React.Component<UrlsProps, UrlsState> {
    @Resolve('urlService')
    public urlService: IUrlService;

    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: UrlsProps) {
        super(props);

        this.state = {
            urls: [],
            showUrlDetailsModal: false,
            selectedUrl: null,
            isLoading: false
        }
    }

    componentDidMount(): void {
        this.setState({ isLoading: true });
        Promise.all([this.searchUrls()]).finally(() => this.setState({ isLoading: false }));
    }

    handlePageDetailsBackButtonClick = (): void => {
        this.setState({ showUrlDetailsModal: false, selectedUrl: null, isLoading: true });
        Promise.all([this.searchUrls()]).finally(() => this.setState({ isLoading: false }));
    }

    searchUrls = async (searchPattern: string = ''): Promise<void> => {
        const query = createSearchQuery(searchPattern);
        const urlsSearchResult = await this.urlService.search(query);
        const allUrls = await getAllValues(urlsSearchResult, urlsSearchResult.value);
        this.setState({ urls: allUrls });
    }

    renderUrlContent = (url: UrlContract): JSX.Element => (
        <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            className="nav-item-outer-stack"
        >
            <Text block nowrap className="nav-item-title">{url.title}</Text>
            <FontIcon
                iconName="Settings"
                title="Edit"
                style={iconStyles}
                className="nav-item-inner"
                tabIndex={0}
                onClick={(event) => {
                    this.setState({ showUrlDetailsModal: true, selectedUrl: url });
                    event.stopPropagation();
                }}
                // Required for accessibility
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        this.setState({ showUrlDetailsModal: true, selectedUrl: url });
                        event.preventDefault();
                    }
                }}
            />
        </Stack>
    )

    render(): JSX.Element {
        return <>
            {this.state.showUrlDetailsModal &&
                <UrlDetailsModal
                    url={this.state.selectedUrl}
                    onDismiss={this.handlePageDetailsBackButtonClick.bind(this)}
                />
            }
            <BackButton onClick={this.props.onBackButtonClick} />
            <Stack className="nav-item-description-container">
                <Text className="description-text">Manage URLs pointing to external resources. You can use these URLs in menus, buttons, hyperlinks, and other elements.</Text>
            </Stack>
            <CommandBarButton
                iconProps={addIcon}
                text="Add URL"
                className="nav-item-list-button"
                onClick={() => this.setState({ showUrlDetailsModal: true, selectedUrl: null })}
            />
            <SearchBox
                ariaLabel="Search URLs"
                placeholder="Search URLs..."
                onChange={(event, searchValue) => this.searchUrls(searchValue)}
                styles={{ root: { marginTop: 20 } }}
            />
            <div className="objects-list">
                {this.state.isLoading && <Spinner />}
                {this.state.urls.length === 0 && !this.state.isLoading
                    ? <Text block className="nav-item-description-container">It seems that you don't have URLs yet. Would you like to create one?</Text>
                    : this.state.urls.map(url =>
                        <CommandBarButton
                            iconProps={linkIcon}
                            text={url.title}
                            key={url.key}
                            className="nav-item-list-button"
                            onRenderText={() => this.renderUrlContent(url)}
                        />
                )}
            </div>
        </>
    }
}