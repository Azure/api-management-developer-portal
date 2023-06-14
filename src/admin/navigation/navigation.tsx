import * as React from 'react';
import { EventManager } from '@paperbits/common/events';
import { INavigationService } from '@paperbits/common/navigation';
import { NavigationItemContract } from '@paperbits/common/navigation/navigationItemContract';
import { Resolve } from '@paperbits/react/decorators';
import { CommandBarButton, FontIcon, IIconProps, INavLink, INavLinkGroup, Nav, Stack, Text } from '@fluentui/react';
import { BackButton } from '../utils/components/backButton';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { NavigationItemModal } from './navigationItemModal';

interface NavigationState {
    navigationItems: NavigationItemContract[],
    navigationItemsToRender: INavLinkGroup[], // needed as Nav component uses different structure
    hoveredNavItem: string,
    currentNavItem: NavigationItemContract,
    showDeleteConfirmation: boolean,
    showNavigationItemModal: boolean
}

interface PagesProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const iconStyles = { width: '16px' };

export class Navigation extends React.Component<PagesProps, NavigationState> {
    @Resolve('navigationService')
    public navigationService: INavigationService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: PagesProps) {
        super(props);

        this.state = {
            navigationItems: [],
            navigationItemsToRender: [],
            hoveredNavItem: null,
            currentNavItem: null,
            showDeleteConfirmation: false,
            showNavigationItemModal: false
        }
    }

    componentDidMount(): void {
        this.loadNavigationItems();
    }

    loadNavigationItems = async (): Promise<void> => {
        const navItems = await this.navigationService.getNavigationItems();
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

    closePopUps = (): void => {
        this.setState({ currentNavItem: null, showDeleteConfirmation: false, showNavigationItemModal: false });
        this.loadNavigationItems();
    }

    deleteNavItem = async (): Promise<void> => {
        const updatedNavItems = this.removeNavItem(this.state.navigationItems, this.state.currentNavItem.key);
        await this.navigationService.updateNavigation(updatedNavItems);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.closePopUps();
    }

    removeNavItem = (navItems: NavigationItemContract[], removableNavItemKey: string): NavigationItemContract[] => (
        navItems.filter(navItem => {
            const keep = navItem.key !== removableNavItemKey;
            
            if (keep && navItem.navigationItems) {
                navItem.navigationItems = this.removeNavItem(navItem.navigationItems, removableNavItemKey);
            }

            return keep;
        })
    )

    findNavItemByKey = (navItems: NavigationItemContract[], value: string): NavigationItemContract => {
        for (const obj of navItems) {
            if (obj.key === value) {
                return obj;
            }

            if (obj.navigationItems && obj.navigationItems.length > 0) {
                const result = this.findNavItemByKey(obj.navigationItems, value);
                if (result !== null) {
                    return result;
                }
            }
        }

        return null;
    }

    renderNavItemContent = (navItem: INavLink): JSX.Element => (
        <Stack horizontal horizontalAlign="space-between" className="nav-item-outer-stack">
            <Text>{navItem.name}</Text>
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }} className="nav-item-inner">
                <FontIcon
                    iconName="Settings"
                    title="Edit"
                    style={iconStyles}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.setState({ showNavigationItemModal: true, currentNavItem: this.findNavItemByKey(this.state.navigationItems, navItem.key) })}
                    }
                />
                <FontIcon
                    iconName="Delete"
                    title="Delete"
                    style={iconStyles}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.setState({ showDeleteConfirmation: true, currentNavItem: this.findNavItemByKey(this.state.navigationItems, navItem.key) })}
                    }
                />
            </Stack>
        </Stack>
    )

    render(): JSX.Element {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.currentNavItem.label}
                    onConfirm={this.deleteNavItem.bind(this)}
                    onDismiss={this.closePopUps.bind(this)} 
                />
            }
            {this.state.showNavigationItemModal &&
                <NavigationItemModal
                    navItem={this.state.currentNavItem}
                    navItems={this.state.navigationItems}
                    onDelete={this.deleteNavItem.bind(this)}
                    onDismiss={this.closePopUps.bind(this)}
                />
            }
            <>
                <BackButton onClick={this.props.onBackButtonClick} />
                <Stack className="nav-item-description-container">
                    <Text className="description-title">Site menu</Text>
                    <Text className="description-text">Manage and organize your website main menu.</Text>
                </Stack>
                <CommandBarButton
                    iconProps={addIcon}
                    text="Add item"
                    className="nav-item-list-button"
                    onClick={() => this.setState({ showNavigationItemModal: true, currentNavItem: null })}
                />
                {/* It seems that you don't have navigation items yet. Would you like to create one? */}
                <Nav
                    ariaLabel="Site menu"
                    groups={this.state.navigationItemsToRender}
                    onRenderLink={(item) => this.renderNavItemContent(item)}
                />
            </>
        </>
    }
}