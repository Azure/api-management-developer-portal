import * as React from 'react';
import { ViewManager } from '@paperbits/common/ui';
import { EventManager } from '@paperbits/common/events';
import { OfflineObjectStorage } from '@paperbits/common/persistence';
import { Resolve } from '@paperbits/react/decorators';
import { ContentWorkshop } from '../components/content';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { CommandBarButton, DefaultButton, Dropdown, Icon, IDropdownOption, IIconProps, PrimaryButton, Stack, ThemeProvider } from '@fluentui/react';
import { lightTheme, darkTheme } from './utils/themes';
initializeIcons();

interface RightPanelState {
    selectedScreenSize: IDropdownOption,
    isFocusedState: boolean,
    hasUnsavedChanges: boolean,
    canUndo: boolean,
    canRedo: boolean,
    dropdownIconStyles: object
}

const screenSizeOptions: IDropdownOption[] = [
    { key: 'xl', text: 'Extra large screen', data: { icon: 'TVMonitor' } },
    { key: 'lg', text: 'Large screen', data: { icon: 'TVMonitor' } },
    { key: 'md', text: 'Medium screen', data: { icon: 'TVMonitor' } },
    { key: 'sm', text: 'Small screen', data: { icon: 'Tablet' } },
    { key: 'xs', text: 'Extra small screen', data: { icon: 'MobileSelected' } }
];

const accessOptions: IDropdownOption[] = [
    { key: 'all', text: 'All groups', data: { icon: 'People' } }
];
;
const dropdownStyles = { title: { border: 'none' } };
const iconStyles = { root: { color: darkTheme.callingPalette.iconWhite } };
const undoIcon: IIconProps = { iconName: 'Undo', styles: iconStyles };
const redoIcon: IIconProps = { iconName: 'Redo', styles: iconStyles };

export class RightPanel extends React.Component<{}, RightPanelState> {
    @Resolve('viewManager')
    public viewManager: ViewManager;

    @Resolve('eventManager')
    public eventManager: EventManager;

    @Resolve('offlineObjectStorage')
    public offlineObjectStorage: OfflineObjectStorage;

    @Resolve('contentWorkshop')
    public contentWorkshop: ContentWorkshop;

    constructor(props: any) {
        super(props);

        this.state = {
            selectedScreenSize: screenSizeOptions[0],
            isFocusedState: false,
            hasUnsavedChanges: false,
            canUndo: false,
            canRedo: false,
            dropdownIconStyles: { marginRight: '8px', color: lightTheme.palette.themePrimary }
        };
    }

    componentDidMount(): void {
        this.eventManager.addEventListener('onDataChange', this.onDataChange.bind(this));
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
        document.getElementById('admin-left-panel').classList.toggle('hidden');
        document.getElementById('main-content-wrapper').classList.toggle('is-focused');
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

    renderTitle = (options: IDropdownOption[]): JSX.Element => {
        const option = options[0];
      
        return this.renderDropdownOption(option);
    }

    renderDropdowns = (): JSX.Element => (
        <Stack horizontal>
            <Dropdown
                defaultSelectedKey="all"
                ariaLabel="Access group selector"
                onRenderOption={this.renderDropdownOption}
                onRenderTitle={this.renderTitle}
                options={accessOptions}
                styles={dropdownStyles}
            />
            <Dropdown
                defaultSelectedKey="xl"
                ariaLabel="Screen size selector"
                onRenderOption={this.renderDropdownOption}
                onRenderTitle={this.renderTitle}
                options={screenSizeOptions}
                onChange={(event, option) => this.viewManager.setViewport(option.key.toString())}
                styles={dropdownStyles}
            />
        </Stack>
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
                            styles={{ root: { height: '100%' } }}
                        >
                            {this.state.isFocusedState
                                ?
                                    <>
                                        {this.renderDropdowns()}
                                        <Stack horizontal verticalAlign="center">
                                            <CommandBarButton
                                                iconProps={undoIcon}
                                                text="Undo"
                                                onClick={() => this.eventManager.dispatchEvent("onUndo")}
                                                className="nav-item-list-button"
                                                disabled={!this.state.canUndo}
                                            />
                                            <CommandBarButton
                                                iconProps={redoIcon}
                                                text="Redo"
                                                onClick={() => this.eventManager.dispatchEvent("onRedo")}
                                                className="nav-item-list-button"
                                                disabled={!this.state.canRedo}
                                            />
                                            <PrimaryButton
                                                text="Save"
                                                onClick={() => this.eventManager.dispatchEvent('onSaveChanges')}
                                                disabled={!this.state.hasUnsavedChanges}
                                                styles={{ root: { margin: '0 20px 0 10px' } }}
                                            />
                                            <DefaultButton
                                                text="Discard"
                                                onClick={() => this.toggleFocusedState()}
                                            />
                                        </Stack>
                                    </>
                                :
                                    <>
                                        {this.renderDropdowns()}
                                        <PrimaryButton
                                            text="Publish site"
                                            onClick={() => this.contentWorkshop.publish()}
                                        />
                                    </>
                            }
                        </Stack>
                    </div>
                </ThemeProvider>
                <div
                    className={`content-overlay${this.state.isFocusedState ? ' hidden' : ''}`}
                    onClick={() => this.toggleFocusedState()}
                ></div>
            </>
        )
    }
}