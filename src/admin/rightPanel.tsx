import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import { ViewManager } from '@paperbits/common/ui';
import { EventManager } from '@paperbits/common/events';
import { OfflineObjectStorage } from '@paperbits/common/persistence';
import { IPageService } from '@paperbits/common/pages';
import { ILayoutService } from '@paperbits/common/layouts';
import { RoleModel, RoleService } from '@paperbits/common/user';
import { Router } from '@paperbits/common/routing';
import { Resolve } from '@paperbits/react/decorators';
import { ContentWorkshop } from '../components/content';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { CommandBarButton, DefaultButton, Dropdown, Icon, IconButton, IDropdownOption, IIconProps, PrimaryButton, Stack, Text, ThemeProvider, TooltipHost } from '@fluentui/react';
import { lightTheme, darkTheme } from './utils/themes';
import { mobileBreakpoint, smallMobileBreakpoint } from '../constants';
initializeIcons();

interface RightPanelState {
    selectedScreenSize: IDropdownOption,
    isFocusedState: boolean,
    isSmallMobile: boolean,
    hasUnsavedChanges: boolean,
    canUndo: boolean,
    canRedo: boolean,
    mobileMenuIsOpened: boolean,
    dropdownIconStyles: object,
    pageName: string,
    roles: RoleModel[],
    rolesOptions: IDropdownOption[]
}

const enum HostNames {
    Page = 'page-host',
    Layout = 'layout-host',
    Styles = 'style-guide'
};

const screenSizeOptions: IDropdownOption[] = [
    { key: 'xl', text: 'Extra large screen', data: { icon: 'TVMonitor' } },
    { key: 'lg', text: 'Large screen', data: { icon: 'TVMonitor' } },
    { key: 'md', text: 'Medium screen', data: { icon: 'TVMonitor' } },
    { key: 'sm', text: 'Small screen', data: { icon: 'Tablet' } },
    { key: 'xs', text: 'Extra small screen', data: { icon: 'MobileSelected' } }
];

const dropdownStyles = { title: { border: 'none' } };
const iconStyles = { root: { color: darkTheme.callingPalette.iconWhite } };
const undoIcon: IIconProps = { iconName: 'Undo', styles: iconStyles };
const redoIcon: IIconProps = { iconName: 'Redo', styles: iconStyles };
const sidePanelToggleIcon: IIconProps = { iconName: 'GlobalNavButton', styles: { root: { color: lightTheme.palette.themePrimary } } };

const anonymousKey: string = 'anonymous';
const anonymousName: string = 'Anonymous';

export class RightPanel extends React.Component<{}, RightPanelState> {
    @Resolve('viewManager')
    public viewManager: ViewManager;

    @Resolve('eventManager')
    public eventManager: EventManager;

    @Resolve('offlineObjectStorage')
    public offlineObjectStorage: OfflineObjectStorage;

    @Resolve('contentWorkshop')
    public contentWorkshop: ContentWorkshop;

    @Resolve('router')
    public router: Router;

    @Resolve('pageService')
    public pageService: IPageService;

    @Resolve('layoutService')
    public layoutService: ILayoutService;

    @Resolve('roleService')
    public roleService: RoleService;

    constructor(props: any) {
        super(props);

        this.state = {
            selectedScreenSize: screenSizeOptions[0],
            isFocusedState: false,
            isSmallMobile: window.innerWidth < smallMobileBreakpoint,
            hasUnsavedChanges: false,
            canUndo: false,
            canRedo: false,
            mobileMenuIsOpened: false,
            dropdownIconStyles: { marginRight: '8px', color: lightTheme.palette.themePrimary },
            pageName: '',
            roles: [{ key: anonymousKey, name: anonymousName }],
            rolesOptions: [{ key: anonymousKey, text: anonymousName }]
        };
    }

    componentDidMount(): void {
        this.eventManager.addEventListener('onDataChange', this.onDataChange.bind(this));
        window.addEventListener('resize', this.checkScreenSize.bind(this));
        this.router.addRouteChangeListener(() => this.getPageName());
        this.getPageName();
        this.checkScreenSize();
        this.getRoles();
    }

    componentWillUnmount() {
        this.eventManager.removeEventListener('onDataChange', this.onDataChange.bind(this));
        window.removeEventListener('resize', this.checkScreenSize.bind(this));        
        this.router.removeRouteChangeListener(() => this.getPageName());
    }

    setPageName = () => {
        if (this.state.isFocusedState) {
            const host = this.viewManager.getHost();
            if (host.name === HostNames.Page) {
                this.getPageName();
            } else if (host.name == HostNames.Layout) {
                this.getLayoutName(host);
            } else if (host.name === HostNames.Styles) {
                this.setState({ pageName: 'Styles' });
            }
        }
    }

    getRoles = async (): Promise<void> => {
        const roles = await this.roleService.getRoles();

        if (!roles) return;

        const dropdownItems = [];
        roles.forEach(page => {
            dropdownItems.push({
                key: page.key,
                text: page.name
            });
        });

        this.setState({ roles, rolesOptions: dropdownItems });
    }

    getPageName = async (): Promise<void> => {
        const page = await this.pageService.getPageByPermalink(this.router.getPath());
        if (page) this.setState({ pageName: 'Page: ' + page.title });
    }

    getLayoutName = async (host): Promise<void> => {
        const layout = await this.layoutService.getLayoutByKey(host.params?.layoutKey);
        if (layout) this.setState({ pageName: 'Layout: ' + layout.title });
    }

    checkScreenSize = (): void => {
        if (!this.state.isFocusedState) {
            if (window.innerWidth < mobileBreakpoint) {
                if (!this.state.mobileMenuIsOpened) {
                    document.getElementById('admin-left-panel').classList.add('hidden');
                    document.getElementById('main-content-wrapper').classList.add('is-focused');
                }
            } else {
                document.getElementById('admin-left-panel').classList.remove('hidden');
                document.getElementById('main-content-wrapper').classList.remove('is-focused');
                this.setState({ mobileMenuIsOpened: false });
            }
        }

        if (window.innerWidth < smallMobileBreakpoint) {
            this.setState({ isSmallMobile: true });

            if (this.state.isFocusedState) document.getElementById('admin-right-panel').classList.add('mobile-small');
        } else {
            this.setState({ isSmallMobile: false });
            document.getElementById('admin-right-panel').classList.remove('mobile-small');
        }
    }

    onDataChange = async (): Promise<void> => {
        const hasChanges = await this.offlineObjectStorage.hasUnsavedChanges();
        this.setState({
            hasUnsavedChanges: hasChanges,
            canUndo: this.offlineObjectStorage.canUndo(),
            canRedo: this.offlineObjectStorage.canRedo()
        });
    }

    toggleFocusedState = (): void => {
        this.setState({
            isFocusedState: !this.state.isFocusedState,
            dropdownIconStyles: {
                marginRight: '8px',
                color: this.state.isFocusedState ? lightTheme.palette.themePrimary : darkTheme.callingPalette.iconWhite
            }
        });

        if (window.innerWidth >= mobileBreakpoint) {
            document.getElementById('admin-left-panel').classList.toggle('hidden');
            document.getElementById('main-content-wrapper').classList.toggle('is-focused');
        }

        if (window.innerWidth < smallMobileBreakpoint) document.getElementById('admin-right-panel').classList.toggle('mobile-small');
    }

    renderDropdownOption = (option: IDropdownOption): JSX.Element => (
        <Stack horizontal verticalAlign="center">
            {option.data && option.data.icon && (
                <Icon
                    style={this.state.dropdownIconStyles}
                    iconName={option.data.icon}
                    title={option.data.icon}
                />
            )}
            <span>{option.text}</span>
        </Stack>
    )

    renderRoleDropdownOption = (option: IDropdownOption): JSX.Element => (
        <Stack horizontal verticalAlign="center">
            <Icon
                style={this.state.dropdownIconStyles}
                iconName="People"
                title="People"
            />
            <span>View as: {option.text}</span>
        </Stack>
    )

    renderTitle = (options: IDropdownOption[]): JSX.Element => {
        const option = options[0];
      
        return this.renderDropdownOption(option);
    }

    renderRoleTitle = (options: IDropdownOption[]): JSX.Element => {
        const option = options[0];

        return this.renderRoleDropdownOption(option);
    }

    renderDropdowns = (): JSX.Element => (
        <Stack horizontal>
            <TooltipHost
                content="Role view selector"
                id="role-view-selector-tooltip"
            >
                <Dropdown
                    defaultSelectedKey={anonymousKey}
                    ariaLabel="Role view selector"
                    aria-describedby="role-view-selector-tooltip"
                    onRenderTitle={this.renderRoleTitle}
                    options={this.state.rolesOptions}
                    onChange={(event, option) => this.viewManager.setViewRoles([this.state.roles.find(role => role.key === option.key)])}
                    styles={dropdownStyles}
                    className="top-panel-dropdown"
                    dropdownWidth={170}
                />
            </TooltipHost>
            <TooltipHost
                content="Screen size selector"
                id="screen-size-selector-tooltip"
            >
                <Dropdown
                    defaultSelectedKey="xl"
                    ariaLabel="Screen size selector"
                    aria-describedby="screen-size-selector-tooltip"
                    onRenderOption={this.renderDropdownOption}
                    onRenderTitle={this.renderTitle}
                    options={screenSizeOptions}
                    onChange={(event, option) => this.viewManager.setViewport(option.key.toString())}
                    styles={dropdownStyles}
                    className="top-panel-dropdown"
                    dropdownWidth={170}
                />
            </TooltipHost>
        </Stack>
    )

    renderSaveDiscardButtons = (): JSX.Element => (
        <>
            <PrimaryButton
                text="Save"
                onClick={() => {
                    this.eventManager.dispatchEvent('onSaveChanges');
                    this.viewManager.setHost({ name: 'page-host' });
                }}
                disabled={!this.state.hasUnsavedChanges}
                styles={{ root: { margin: '0 20px 0 10px', backgroundColor: '#1e74bc', color: '#ffffff' }, rootDisabled: { backgroundColor: '#f3f2f1', color: '#a19f9d' } }}
            />
            <DefaultButton
                text={this.state.hasUnsavedChanges ? 'Discard' : 'Close'}
                onClick={async () => {
                    await this.offlineObjectStorage.discardChanges();
                    this.eventManager.dispatchEvent('onDataPush');
                    this.toggleFocusedState();
                    this.viewManager.setHost({ name: 'page-host' });
                }}
                styles={{ 
                    root: { backgroundColor: '#ffffff', color: '#323130' },
                    rootHovered: { backgroundColor: '#ffffff', color: '#323130' }
                }}
            />
        </>
    )
 
    public render(): JSX.Element {
        return (
            <>
                <ThemeProvider theme={this.state.isFocusedState ? darkTheme : lightTheme} style={{ width: '100%', height: '100%' }}>
                    <div className={`top-panel${this.state.isFocusedState ? ' is-focused' : ''}`}>
                        <Stack
                            horizontal
                            horizontalAlign="space-between"
                            verticalAlign="center"
                            className="top-panel-content"
                        >
                            {this.state.isFocusedState
                                ?
                                    <>
                                        <Stack horizontal verticalAlign="center">
                                            <Text styles={{ root: { padding: '0 15px' } }}>{this.state.pageName}</Text>
                                            {this.renderDropdowns()}
                                        </Stack>
                                        <Stack horizontal verticalAlign="center">
                                            <CommandBarButton
                                                iconProps={undoIcon}
                                                text="Undo"
                                                onClick={() => this.eventManager.dispatchEvent("onUndo")}
                                                className="nav-item-list-button top-panel-command-button"
                                                disabled={!this.state.canUndo}
                                            />
                                            <CommandBarButton
                                                iconProps={redoIcon}
                                                text="Redo"
                                                onClick={() => this.eventManager.dispatchEvent("onRedo")}
                                                className="nav-item-list-button top-panel-command-button"
                                                disabled={!this.state.canRedo}
                                            />
                                            {!this.state.isSmallMobile && this.renderSaveDiscardButtons()}
                                        </Stack>
                                    </>
                                :
                                    <>
                                        <Stack
                                            horizontal
                                            horizontalAlign="space-between"
                                            verticalAlign="center"
                                        >
                                            <IconButton
                                                iconProps={sidePanelToggleIcon}
                                                className="admin-side-panel-opener"
                                                onClick={() => {
                                                    this.setState({ mobileMenuIsOpened: true });
                                                    document.getElementById('admin-left-panel').classList.remove('hidden');
                                                }}
                                            />
                                            {this.renderDropdowns()}
                                        </Stack>
                                        <PrimaryButton
                                            text="Publish site"
                                            onClick={() => this.contentWorkshop.publish()}
                                        />
                                    </>
                            }
                        </Stack>
                        {(this.state.isFocusedState && this.state.isSmallMobile) && this.renderSaveDiscardButtons()}
                    </div>
                </ThemeProvider>
                <div
                    className={`content-overlay${this.state.isFocusedState ? ' hidden' : ''}`}
                    onClick={() => this.toggleFocusedState()}
                ></div>
                <ToastContainer hideProgressBar={true} />
            </>
        )
    }
}