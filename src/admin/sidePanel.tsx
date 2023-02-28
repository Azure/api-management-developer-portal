import * as React from "react";
import { Pages } from "./pages/pages";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { IIconProps } from '@fluentui/react';
import { ActionButton } from '@fluentui/react/lib/Button';

initializeIcons();

const enum NavItem {
    Main,
    Pages,
    Styles,
    Navigation,
    Settings,
    Help
}

const pageIcon: IIconProps = { iconName: 'Page' };
const stylesIcon: IIconProps = { iconName: 'Color' };
const navigationIcon: IIconProps = { iconName: 'GlobalNavButton' };
const settingsIcon: IIconProps = { iconName: 'Equalizer' };
const helpIcon: IIconProps = { iconName: 'Help' };

export class SidePanel extends React.Component<{}, { selectedNavItem: NavItem }> {
    constructor(props: any) {
        super(props);

        this.state = {
            selectedNavItem: NavItem.Main
        };
    }

    handleBackButtonClick = () => {
        this.setState({ selectedNavItem: NavItem.Main });
    }

    renderNavItemsSwitch = (navItemValue: NavItem) => {
        switch(navItemValue) {
            case NavItem.Pages:
                return <Pages onBackButtonClick={this.handleBackButtonClick.bind(this)} />;

            default:
                return (
                    <div className="navigation">
                        <ActionButton
                            iconProps={pageIcon}
                            text="Pages"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Pages })}
                            styles={{ root: { display: 'block' } }}
                        />
                        <ActionButton
                            iconProps={stylesIcon}
                            text="Styles"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Styles })}
                            styles={{ root: { display: 'block' } }}
                        />
                        <ActionButton
                            iconProps={navigationIcon}
                            text="Navigation"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Navigation })}
                            styles={{ root: { display: 'block' } }}
                        />
                        <ActionButton
                            iconProps={settingsIcon}
                            text="Settings"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Settings })}
                            styles={{ root: { display: 'block' } }}
                        />
                        <ActionButton
                            iconProps={helpIcon}
                            text="Help"
                            onClick={() => this.setState({ selectedNavItem: NavItem.Help })}
                            styles={{ root: { display: 'block' } }}
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
            </div>
        )
    }
}