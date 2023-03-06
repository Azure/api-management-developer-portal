import * as React from 'react';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { INavigationService, NavigationEvents } from '@paperbits/common/navigation';
import { NavigationItemContract } from '@paperbits/common/navigation/navigationItemContract';
import { Router } from '@paperbits/common/routing';
import { Resolve } from '@paperbits/react/decorators';
import { IIconProps, Stack, ActionButton, Nav, INavLinkGroup, INavLink, Text, FontIcon } from '@fluentui/react';
import { BackButton } from '../utils/components/backButton';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { NavigationItemModal } from './navigationItemModal';

interface NavigationState {
    navigationItems: NavigationItemContract[],
    navigationItemsToRender: INavLinkGroup[], // needed as Nav component uses different structure
    hoveredNavItem: string,
    showDeleteConfirmation: boolean,
    showNavItemModal: boolean,
    currentNavItem: INavLink
}

interface PagesProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const pageIcon: IIconProps = { iconName: 'Page' };
const settingsIcon: IIconProps = { iconName: 'Settings' };
const deleteIcon: IIconProps = { iconName: 'Delete' };

const iconStyles = { width: '16px' };

export class Navigation extends React.Component<PagesProps, NavigationState> {
    @Resolve('navigationService')
    public navigationService: INavigationService;

    @Resolve('router')
    public router: Router;

    constructor(props: PagesProps) {
        super(props);

        this.state = {
            navigationItems: [],
            navigationItemsToRender: [],
            hoveredNavItem: null,
            showDeleteConfirmation: false,
            showNavItemModal: false,
            currentNavItem: null
        }
    }

    componentDidMount(): void {
        this.loadNavigationItems();
    }

    loadNavigationItems = async () => {
        const navItems = await this.navigationService.getNavigationItems();
        console.log(navItems);
        this.setState({ navigationItems: navItems, navigationItemsToRender: [{ links: this.structureNavItems(navItems) }]});
    }

    structureNavItems = (navItems: NavigationItemContract[]): INavLink[] => (
        navItems.map(navItem => {
            const newNode: INavLink = {
                key: navItem.key,
                name: navItem.label,
                url: '',
                targetKey: navItem.targetKey || ''
            };
            
            if (navItem.navigationItems) newNode.links = this.structureNavItems(navItem.navigationItems);

            return newNode;
        })
    )

    renderNavItemContent = (navItem: INavLink) => (
        <Stack horizontal horizontalAlign="space-between" className="nav-item-outer-stack">
            <Text>{navItem.name}</Text>
            <Stack horizontal verticalAlign="center" gap={10} className="nav-item-inner-stack">
                <FontIcon iconName="Settings" title="Edit" style={iconStyles} onClick={() => this.setState({ showNavItemModal: true, currentNavItem: navItem })} />
                <FontIcon iconName="Delete" title="Delete" style={iconStyles} onClick={() => this.setState({ showDeleteConfirmation: true, currentNavItem: navItem })} />
            </Stack>
        </Stack>
    )

    closePopUps = () => {
        this.setState({ showDeleteConfirmation: false, showNavItemModal: false, currentNavItem: null });
    }

    saveNavItem = () => {

    }

    deleteNavItem = async () => {
        const updatedNavItems = this.removeNavItem(this.state.navigationItems, this.state.currentNavItem.key);
        await this.navigationService.updateNavigation(updatedNavItems);
        this.closePopUps();
        this.loadNavigationItems();
    }

    removeNavItem = (navItems: NavigationItemContract[], removableNavItemKey: string) => (
        navItems.filter(navItem => {
            const keep = navItem.key !== removableNavItemKey;
            
            if (keep && navItem.navigationItems) {
                navItem.navigationItems = this.removeNavItem(navItem.navigationItems, removableNavItemKey);
            }

            return keep;
        })
    )

    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.currentNavItem.name}
                    onConfirm={this.deleteNavItem.bind(this)}
                    onDismiss={this.closePopUps.bind(this)} 
                />
            }
            {this.state.showNavItemModal &&
                <NavigationItemModal
                    navItem={this.state.currentNavItem}
                    navItems={this.state.navigationItems}
                    onSave={this.saveNavItem.bind(this)}
                    onDelete={this.deleteNavItem.bind(this)}
                    onDismiss={this.closePopUps.bind(this)}
                />
            }
            <>
                <BackButton onClick={this.props.onBackButtonClick} />
                <Stack className="nav-item-description-container">
                    <Text className="description-title">Navigation</Text>
                    <Text className="description-text">Add or edit navigation menus.</Text>
                </Stack>
                <ActionButton
                    iconProps={addIcon}
                    text="Add navigation item"
                    styles={{ root: { height: 44, display: 'block' } }}
                    onClick={() => this.setState({ showNavItemModal: true, currentNavItem: null })}
                />
                {/* It seems that you don't have navigation items yet. Would you like to create one? */}
                <Nav
                    ariaLabel="Navigation"
                    groups={this.state.navigationItemsToRender}
                    onRenderLink={(item) => this.renderNavItemContent(item)}
                />
            </>
        </>
    }
}