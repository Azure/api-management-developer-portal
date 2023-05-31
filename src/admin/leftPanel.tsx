import * as React from 'react';
import { Pages } from "./pages/pages";
import { Resolve } from '@paperbits/react/decorators';
import { ViewManager } from '@paperbits/common/ui';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { CommandBarButton, IIconProps } from '@fluentui/react';
import { Navigation } from "./navigation/navigation";
import { SettingsModal } from "./settings/settingsModal";
import { HelpModal } from './help/helpModal';
import { MediaModal } from './media/mediaModal';
import { CustomWidgets } from './custom-widgets/customWidgets';
initializeIcons();

const enum NavItem {
    Main,
    Pages,
    Navigation,
    Styles,
    Media,
    CustomWidgets,
    Settings,
    Help
}

interface LeftPanelState {
    selectedNavItem: NavItem
}

const pageIcon: IIconProps = { iconName: 'Page' };
const navigationIcon: IIconProps = { iconName: 'Nav2DMapView' };
const stylesIcon: IIconProps = { iconName: 'Color' };
const mediaIcon: IIconProps = { iconName: 'Photo2' };
const customWidgetsIcon: IIconProps = { iconName: 'Puzzle' };
const settingsIcon: IIconProps = { iconName: 'Settings' };
const helpIcon: IIconProps = { iconName: 'Help' };

export class LeftPanel extends React.Component<{}, LeftPanelState> {
    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: any) {
        super(props);

        this.state = {
            selectedNavItem: NavItem.Main
        };
    }

    handleBackButtonClick = (): void => {
        this.setState({ selectedNavItem: NavItem.Main });
    }

    renderNavItemsSwitch = (navItemValue: NavItem): JSX.Element => {
        switch(navItemValue) {
            case NavItem.Pages:
                return <Pages onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            case NavItem.Navigation:
                return <Navigation onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            case NavItem.CustomWidgets:
                return <CustomWidgets onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            default:
                return (
                    <div className="navigation">
                        <CommandBarButton
                            iconProps={navigationIcon}
                            text="Site menu"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Navigation })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={pageIcon}
                            text="Pages"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Pages })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={mediaIcon}
                            text="Media"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Media })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={stylesIcon}
                            text="Styles"
                            onClick={() => {
                                this.setState({ selectedNavItem: NavItem.Styles });
                                this.viewManager.setHost({ name: "style-guide" }, true);
                            }}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={customWidgetsIcon}
                            text="Custom widgets"
                            onClick={() => this.setState({ selectedNavItem: NavItem.CustomWidgets })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={settingsIcon}
                            text="Settings"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Settings })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={helpIcon}
                            text="Help"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Help })}
                            className="nav-item-list-button"
                        />
                    </div>
                );
        }
    }

    public render(): JSX.Element {
        return (
            <div className="side-panel">
                <div className="portal-name"><span className="icon-home"></span>mydevportal</div>
                { this.renderNavItemsSwitch(this.state.selectedNavItem) }
                { this.state.selectedNavItem === NavItem.Media && <MediaModal onDismiss={this.handleBackButtonClick.bind(this)} /> }
                { this.state.selectedNavItem === NavItem.Settings && <SettingsModal onDismiss={this.handleBackButtonClick.bind(this)} /> }
                { this.state.selectedNavItem === NavItem.Help && <HelpModal onDismiss={this.handleBackButtonClick.bind(this)} /> }
            </div>
        )
    }
}