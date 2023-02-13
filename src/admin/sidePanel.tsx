import * as React from "react";
import { Pages } from "./pages";

const enum NavItem {
    Main,
    Pages,
    Styles,
    Navigation,
    Settings,
    Help
}

export class SidePanel extends React.Component<{}, { selectedNavItem: NavItem }> {
    constructor(props: any) {
        super(props);

        this.state = {
            selectedNavItem: NavItem.Main
        };
    }

    renderBackButton = () => (
        <div className="nav-item" onClick={() => this.setState({ selectedNavItem: NavItem.Main })}><span className="nav-back-button"></span>Back</div>
    )

    renderNavItemsSwitch = (navItemValue: NavItem) => {
        switch(navItemValue) {
            case NavItem.Pages:
                return <Pages />;

            default:
                return (
                    <div className="navigation">
                        <a className="nav-item" onClick={() => this.setState({ selectedNavItem: NavItem.Pages })}><span className="nav-item-icon icon-pages"></span>Pages</a>
                        <a className="nav-item" onClick={() => this.setState({ selectedNavItem: NavItem.Styles })}><span className="nav-item-icon icon-styles"></span>Styles</a>
                        <a className="nav-item" onClick={() => this.setState({ selectedNavItem: NavItem.Navigation })}><span className="nav-item-icon icon-nav"></span>Navigation</a>
                        <a className="nav-item" onClick={() => this.setState({ selectedNavItem: NavItem.Settings })}><span className="nav-item-icon icon-settings"></span>Settings</a>
                        <a className="nav-item" onClick={() => this.setState({ selectedNavItem: NavItem.Help })}><span className="nav-item-icon icon-help"></span>Help</a>
                    </div>
                );
        }
    }

    public render(): JSX.Element {
        return (
            <div className="side-panel">
                <div className="portal-name"><span className="icon-home"></span>mydevportal</div>
                { this.state.selectedNavItem !== NavItem.Main && this.renderBackButton() }
                { this.renderNavItemsSwitch(this.state.selectedNavItem) }
            </div>
        )
    }
}