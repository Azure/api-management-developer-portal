import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IPopupService, PopupContract } from '@paperbits/common/popups';
import { ViewManager } from '@paperbits/common/ui';
import { CommandBarButton, FontIcon, IIconProps, SearchBox, Spinner, Stack, Text } from '@fluentui/react';
import { createSearchQuery, getAllValues } from '../utils/helpers';
import { lightTheme } from '../utils/themes';
import { BackButton } from '../utils/components/backButton';
import { PopupDetailsModal } from './popupDetailsModal';

interface PopupsState {
    popups: PopupContract[],
    showPopupDetailsModal: boolean,
    selectedPopup: PopupContract,
    isLoading: boolean
}

interface PopupsProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const popupIcon: IIconProps = { iconName: 'Documentation' };

const iconStyles = { width: '16px', color: lightTheme.palette.themePrimary };

export class Popups extends React.Component<PopupsProps, PopupsState> {
    @Resolve('popupService')
    public popupService: IPopupService;

    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: PopupsProps) {
        super(props);

        this.state = {
            popups: [],
            showPopupDetailsModal: false,
            selectedPopup: null,
            isLoading: false
        }
    }

    componentDidMount(): void {
        this.setState({ isLoading: true });
        Promise.all([this.searchPopups()]).finally(() => this.setState({ isLoading: false }));
    }

    handlePageDetailsBackButtonClick = (): void => {
        this.setState({ showPopupDetailsModal: false, selectedPopup: null, isLoading: true });
        Promise.all([this.searchPopups()]).finally(() => this.setState({ isLoading: false }));
    }

    searchPopups = async (searchPattern: string = ''): Promise<void> => {
        const query = createSearchQuery(searchPattern);
        const popupsSearchResult = await this.popupService.search(query);
        const allPopups = await getAllValues(popupsSearchResult, popupsSearchResult.value);
        this.setState({ popups: allPopups });
    }

    renderPopupContent = (popup: PopupContract): JSX.Element => (
        <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            className="nav-item-outer-stack"
        >
            <Text block nowrap className="nav-item-title">{popup.title}</Text>
            <FontIcon
                iconName="Settings"
                title="Edit"
                style={iconStyles}
                className="nav-item-inner"
                tabIndex={0}
                onClick={(event) => {
                    this.setState({ showPopupDetailsModal: true, selectedPopup: popup });
                    event.stopPropagation();
                }}
                // Required for accessibility
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        this.setState({ showPopupDetailsModal: true, selectedPopup: popup });
                        event.preventDefault();
                    }
                }}
            />
        </Stack>
    )

    render(): JSX.Element {
        return <>
            {this.state.showPopupDetailsModal &&
                <PopupDetailsModal
                    popup={this.state.selectedPopup}
                    onDismiss={this.handlePageDetailsBackButtonClick.bind(this)}
                />
            }
            <BackButton onClick={this.props.onBackButtonClick} />
            <Stack className="nav-item-description-container">
                <Text className="description-text">Manage pop-ups - floating windows displayed on top of page content, which are invoked by users' actions, like clicking or hovering over links, buttons, or other elements.</Text>
            </Stack>
            <CommandBarButton
                iconProps={addIcon}
                text="Add pop-up"
                className="nav-item-list-button"
                onClick={() => this.setState({ showPopupDetailsModal: true, selectedPopup: null })}
            />
            <SearchBox
                ariaLabel="Search popups"
                placeholder="Search popups..."
                onChange={(event, searchValue) => this.searchPopups(searchValue)}
                styles={{ root: { marginTop: 20 } }}
            />
            <div className="objects-list">
                {this.state.isLoading && <Spinner />}
                {this.state.popups.length === 0 && !this.state.isLoading
                    ? <Text block className="nav-item-description-container">It seems that you don't have pop-ups yet. Would you like to create one?</Text>
                    : this.state.popups.map(popup =>
                        <CommandBarButton
                            iconProps={popupIcon}
                            text={popup.title}
                            key={popup.key}
                            className="nav-item-list-button"
                            onRenderText={() => this.renderPopupContent(popup)}
                        />
                )}
            </div>
        </>
    }
}