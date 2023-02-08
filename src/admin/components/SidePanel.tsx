import * as React from 'react';
import { useState } from 'react';
import Pages from './Pages';

const enum NavItem {
    Main,
    Pages,
    Styles,
    Navigation,
    Settings,
    Help
}

// const SidePanel = () => {
//     const [selectedNavItem, setSelectedNavItem] = useState(NavItem.Main);

//     const renderNavItemsSwitch = (navItemValue: NavItem) => {
//         switch(navItemValue) {
//             case NavItem.Pages:
//                 return <Pages />;

//             default:
//                 return (
//                     <div className='navigation'>
//                         <a className='nav-item' onClick={() => setSelectedNavItem(NavItem.Pages)}>Pages</a>
//                         <a className='nav-item' onClick={() => setSelectedNavItem(NavItem.Styles)}>Styles</a>
//                         <a className='nav-item' onClick={() => setSelectedNavItem(NavItem.Navigation)}>Navigation</a>
//                         <a className='nav-item' onClick={() => setSelectedNavItem(NavItem.Settings)}>Settings</a>
//                         <a className='nav-item' onClick={() => setSelectedNavItem(NavItem.Help)}>Help</a>
//                     </div>
//                 );
//         }
//     }

//     return (
//         <div className='side-panel'>
//             <div className='portal-name'>mydevportal</div>
//             { renderNavItemsSwitch(selectedNavItem) }
//         </div>
//     );
// }

class SidePanel extends React.Component<{}, { selectedNavItem: NavItem }> {
    constructor(props: any) {
        super(props);

        this.state = {
            selectedNavItem: NavItem.Main
        };
    }

    
    renderNavItemsSwitch = (navItemValue: NavItem) => {
        switch(navItemValue) {
            case NavItem.Pages:
                return <Pages />;

            default:
                return (
                    <div className='navigation'>
                        <a className='nav-item' onClick={() => this.setState({ selectedNavItem: NavItem.Pages })}><span className='nav-item-icon icon-pages'></span>Pages</a>
                        <a className='nav-item' onClick={() => this.setState({ selectedNavItem: NavItem.Styles })}><span className='nav-item-icon icon-styles'></span>Styles</a>
                        <a className='nav-item' onClick={() => this.setState({ selectedNavItem: NavItem.Navigation })}><span className='nav-item-icon icon-nav'></span>Navigation</a>
                        <a className='nav-item' onClick={() => this.setState({ selectedNavItem: NavItem.Settings })}><span className='nav-item-icon icon-settings'></span>Settings</a>
                        <a className='nav-item' onClick={() => this.setState({ selectedNavItem: NavItem.Help })}><span className='nav-item-icon icon-help'></span>Help</a>
                    </div>
                );
        }
    }

    render() {
        return (
            <div className='side-panel'>
                <div className='portal-name'><span className='icon-home'></span>mydevportal</div>
                { this.renderNavItemsSwitch(this.state.selectedNavItem) }
            </div>
        )
    }
}

export default SidePanel;
