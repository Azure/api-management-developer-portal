import * as React from 'react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Dropdown, getTheme, Icon, IDropdownOption, PrimaryButton, Stack } from '@fluentui/react';
import { ViewManager } from '@paperbits/common/ui';
import { Resolve } from '@paperbits/react/decorators';

initializeIcons();

interface TopPanelState {
    selectedScreenSize: IDropdownOption
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

const theme = getTheme();
const iconStyles = { marginRight: '8px', color: theme.palette.themePrimary };
const dropdownStyles = { title: { border: 'none' } };

export class TopPanel extends React.Component<{}, TopPanelState> {
    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: any) {
        super(props);

        this.state = {
            selectedScreenSize: screenSizeOptions[0]
        };
    }

    // Do we need it?
    // componentDidMount(): void {
    //     this.setState({ screenSize: this.viewManager.getViewport() });
    // }

    renderDropdownOption = (option: IDropdownOption) => (
        <Stack horizontal verticalAlign="center">
            {option.data && option.data.icon && (
                <Icon
                    style={iconStyles}
                    iconName={option.data.icon}
                    title={option.data.icon}
                />
            )}
            <span>{option.text}</span>
        </Stack>
    )

    renderTitle = (options: IDropdownOption[]) => {
        const option = options[0];
      
        return this.renderDropdownOption(option);
    }

    public render(): JSX.Element {
        return (
            <div className="top-panel">
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
                <PrimaryButton
                    text="Publish site"
                    disabled
                />
            </div>
        )
    }
}