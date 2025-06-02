import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { ISiteService } from '@paperbits/common/sites';
import { EventManager } from '@paperbits/common/events';
import { ViewManager } from '@paperbits/common/ui';
import { Router } from '@paperbits/common/routing';
import { Logger } from '@paperbits/common/logging';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { CommandBarButton, Icon, IIconProps, Separator, Stack, Text, Toggle } from '@fluentui/react';
import { Pages } from './pages/pages';
import { Navigation } from './navigation/navigation';
import { Urls } from './urls/urls';
import { Popups } from './popups/popups';
import { SettingsModal } from './settings/settingsModal';
import { HelpModal } from './help/helpModal';
import { MediaModal } from './media/mediaModal';
import { CustomWidgets } from './custom-widgets/customWidgets';
import { OnboardingModal } from './onboardingModal';
import { lightTheme } from './utils/themes';
import { isRedesignEnabledSetting, mobileBreakpoint, newTheme, themeSetting } from '../constants';
initializeIcons();

const enum NavItem {
    Main,
    Pages,
    Navigation,
    URLs,
    Popups,
    Styles,
    Media,
    CustomWidgets,
    Settings,
    New,
    Feedback,
    Help
}

interface LeftPanelState {
    selectedNavItem: NavItem,
    isMobile: boolean,
    showOnboardingModal: boolean,
    isRedesignEnabled: boolean,
    isNewThemeEnabled: boolean
}

const pageIcon: IIconProps = { iconName: 'Page' };
const navigationIcon: IIconProps = { iconName: 'Nav2DMapView' };
const urlIcon: IIconProps = { iconName: 'Link' };
const popupsIcon: IIconProps = { iconName: 'Documentation' };
const stylesIcon: IIconProps = { iconName: 'Color' };
const mediaIcon: IIconProps = { iconName: 'Photo2' };
const customWidgetsIcon: IIconProps = { iconName: 'Puzzle' };
const settingsIcon: IIconProps = { iconName: 'Settings' };
const whatsNewIcon: IIconProps = { iconName: 'Rocket' };
const feedbackIcon: IIconProps = { iconName: 'Megaphone' };
const helpIcon: IIconProps = { iconName: 'Help' };

const iconStyles = { root: { color: lightTheme.palette.themePrimary, fontSize: 20 } };

export class LeftPanel extends React.Component<{}, LeftPanelState> {
    @Resolve('siteService')
    public declare siteService: ISiteService;

    @Resolve('eventManager')
    public declare eventManager: EventManager;

    @Resolve('viewManager')
    public declare viewManager: ViewManager;

    @Resolve('router')
    public declare router: Router;

    @Resolve('logger')
    public declare logger: Logger;

    constructor(props: any) {
        super(props);

        this.state = {
            selectedNavItem: NavItem.Main,
            isMobile: window.innerWidth < mobileBreakpoint,
            showOnboardingModal: false,
            isRedesignEnabled: false,
            isNewThemeEnabled: false
        };
    }

    componentDidMount(): void {
        if (!localStorage.getItem('isOnboardingSeen')) this.setState({ showOnboardingModal: true });
        this.loadSettings();

        window.addEventListener('resize', this.checkScreenSize.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }

    loadSettings = async (): Promise<void> => {
        let redesignSetting = false;
        try {
            redesignSetting = await this.siteService.getSetting(isRedesignEnabledSetting);
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - admin panel` });
        }

        let themeSettingValue = '';
        try {
            themeSettingValue = await this.siteService.getSetting(themeSetting);
            console.log(themeSettingValue);
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${themeSetting} - admin panel` });
        }

        this.setState({ isRedesignEnabled: !!redesignSetting });
        this.setState({ isNewThemeEnabled: themeSettingValue === newTheme });
    }

    checkScreenSize = (): void => {
        if (window.innerWidth < mobileBreakpoint) {
            this.setState({ isMobile: true });
        } else {
            this.setState({ isMobile: false });
        }
    }

    handleBackButtonClick = (): void => {
        this.setState({ selectedNavItem: NavItem.Main });
        this.viewManager.setHost({ name: 'page-host' });
    }

    handleOnboardingModalClose = (): void => {
        this.setState({ showOnboardingModal: false });
        localStorage.setItem('isOnboardingSeen', 'true');
    }

    renderNavItemsSwitch = (navItemValue: NavItem): JSX.Element => {
        switch(navItemValue) {
            case NavItem.Pages:
                return <Pages onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            case NavItem.Navigation:
                return <Navigation onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            case NavItem.URLs:
                return <Urls onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            case NavItem.Popups:
                return <Popups onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            case NavItem.CustomWidgets:
                return <CustomWidgets onBackButtonClick={this.handleBackButtonClick.bind(this)} />;
            default:
                return (
                    <div className="navigation">
                        <CommandBarButton
                            iconProps={pageIcon}
                            text="Pages"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Pages })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={navigationIcon}
                            text="Site menu"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Navigation })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={urlIcon}
                            text="URLs"
                            onClick={() => this.setState({ selectedNavItem: NavItem.URLs })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={popupsIcon}
                            text="Pop-ups"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Popups })}
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
                                if (window.innerWidth < mobileBreakpoint) document.getElementById('admin-left-panel').classList.add('hidden');
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
                        <Separator />
                        <CommandBarButton
                            iconProps={whatsNewIcon}
                            text="What's new"
                            onClick={() => this.setState({ selectedNavItem: NavItem.New, showOnboardingModal: true })}
                            className="nav-item-list-button"
                        />
                        <CommandBarButton
                            iconProps={feedbackIcon}
                            onRenderText={() =>
                                <Text block styles={{ root: { flexGrow: 1, margin: '0 4px' } }}>
                                    Give feedback
                                    <Icon iconName="OpenInNewWindow" styles={{ root: { paddingLeft: 5 } }} />
                                </Text>
                            }
                            onClick={() => window.open('https://github.com/Azure/api-management-developer-portal/issues', '_blank', 'noreferrer')}
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
            <>
                {this.state.showOnboardingModal && <OnboardingModal onDismiss={this.handleOnboardingModalClose.bind(this)} />}
                <div className="side-panel">
                    <Stack horizontal className="portal-name-container">
                        <Stack horizontal verticalAlign="center" onClick={async () => await this.router.navigateTo('/')} styles={{ root: { cursor: 'pointer' } }}>
                            <Icon iconName="Home" styles={iconStyles} />
                            <Text className="portal-name">Home</Text>
                        </Stack>
                        <Icon
                            iconName="Cancel"
                            className="admin-side-panel-closer"
                            styles={iconStyles}
                            onClick={() => {
                                this.setState({ selectedNavItem: NavItem.Main });
                                document.getElementById('admin-left-panel').classList.add('hidden');
                            }}
                        />
                    </Stack>
                    <div className="side-panel-content">
                        { this.renderNavItemsSwitch(this.state.selectedNavItem) }
                    </div>
                    { this.state.selectedNavItem === NavItem.Media && <MediaModal onDismiss={this.handleBackButtonClick.bind(this)} /> }
                    { this.state.selectedNavItem === NavItem.Settings && <SettingsModal onDismiss={this.handleBackButtonClick.bind(this)} /> }
                    { this.state.selectedNavItem === NavItem.Help && <HelpModal onDismiss={this.handleBackButtonClick.bind(this)} /> }
                    {!this.state.isNewThemeEnabled &&
                        <Toggle
                            label={"Preview new UI design"}
                            onText={"On"}
                            offText={"Off"}
                            checked={this.state.isRedesignEnabled}
                            onChange={async (_, checked) => {
                                this.setState({ isRedesignEnabled: checked });
                                await this.siteService.setSetting(isRedesignEnabledSetting, checked);
                                this.logger.trackEvent(`${checked ? 'Checked' : 'Unchecked'}: Preview new UI design`);
                                this.eventManager.dispatchEvent('onSaveChanges');
                                this.eventManager.dispatchEvent('onDataPush'); // Needed to reload the runtime part
                            }}
                        />
                    }
                </div>
            </>
        )
    }
}