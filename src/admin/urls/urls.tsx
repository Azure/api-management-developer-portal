import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IUrlService, UrlContract } from '@paperbits/common/urls';
import { Query, Operator } from '@paperbits/common/persistence';
import { ViewManager } from '@paperbits/common/ui';
import { CommandBarButton, FontIcon, IIconProps, SearchBox, Stack, Text } from '@fluentui/react';
import { getAllValues } from '../utils/helpers';
import { lightTheme } from '../utils/themes';
import { BackButton } from '../utils/components/backButton';
import { UrlDetailsModal } from './urlDetailsModal';

interface UrlsState {
    urls: UrlContract[],
    showUrlDetailsModal: boolean,
    selectedUrl: UrlContract
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
            selectedUrl: null
        }
    }

    componentDidMount(): void {
        this.searchUrls();
    }

    handlePageDetailsBackButtonClick = (): void => {
        this.setState({ showUrlDetailsModal: false, selectedUrl: null });
        this.searchUrls();
    }

    searchUrls = async (searchPattern: string = ''): Promise<void> => {
        const query = Query.from().orderBy('title');
        if (searchPattern) {
            query.where('title', Operator.contains, searchPattern);
        }

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
                onClick={(event) => {
                    event.stopPropagation();
                    this.setState({ showUrlDetailsModal: true, selectedUrl: url })}
                }
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
                {this.state.urls.map(url =>
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