import * as React from 'react';
import { EventManager } from '@paperbits/common/events';
import { INavigationService } from '@paperbits/common/navigation';
import { NavigationItemContract } from '@paperbits/common/navigation/navigationItemContract';
import { Resolve } from '@paperbits/react/decorators';
import { CommandBarButton, FontIcon, IIconProps, INavLink, INavLinkGroup, Nav, Spinner, Stack, Text } from '@fluentui/react';
import { BackButton } from '../utils/components/backButton';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { NavigationItemModal } from './navigationItemModal';

interface NavigationState {
    navigationItems: NavigationItemContract[],
    navigationItemsToRender: INavLinkGroup[], // needed as Nav component uses different structure
    hoveredNavItem: string,
    currentNavItem: NavigationItemContract,
    showDeleteConfirmation: boolean,
    showNavigationItemModal: boolean,
    isLoading: boolean
}

interface PagesProps {
    onBackButtonClick: () => void
}

const enum ItemPosition {
    FIRST,
    LAST,
    FIRST_AND_LAST,
    NOT_FIRST_OR_LAST
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
            showNavigationItemModal: false,
            isLoading: false
        }
    }

    componentDidMount(): void {
        this.loadNavigationItems();
    }

    loadNavigationItems = async (): Promise<void> => {
        this.setState({ isLoading: true });
        Promise.all([this.navigationService.getNavigationItems()])
            .then(navItems => this.setState({ navigationItems: navItems[0], navigationItemsToRender: [{ links: this.structureNavItems(navItems[0]) }]}))
            .finally(() => this.setState({ isLoading: false }));
    }

    structureNavItems = (navItems: NavigationItemContract[]): INavLink[] => (
        navItems.map(navItem => {
            const newNode: INavLink = {
                key: navItem.key,
                name: navItem.label,
                url: '',
                targetKey: navItem.targetKey || '',
                isExpanded: true
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

    findParentItemKey = (array: NavigationItemContract[], childKey: string, parentKey: string = ''): string => {
        for (const obj of array) {
            if (obj.key === childKey) {
                return parentKey;
            }

            if (obj.navigationItems && obj.navigationItems.length > 0) {
                const nestedParentKey = this.findParentItemKey(obj.navigationItems, childKey, obj.key);
                if (nestedParentKey !== null) {
                    return nestedParentKey;
                }
            }
        }

        return null;
    }

    moveItemUp = async (array: NavigationItemContract[], parentKey: string, itemKey: string): Promise<void> => {
        const updatedArray = JSON.parse(JSON.stringify(array)); // Create a deep copy of the array

        const moveItemUpRecursive = (items: NavigationItemContract[], parentKey: string) => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.key === itemKey) {
                    // Move the item up within its parent's navigationItems array
                    if (i > 0) {
                        [items[i - 1], items[i]] = [items[i], items[i - 1]];
                    }
                    return true;
                }

                if (item.navigationItems) {
                    // Recursively search in nested items
                    if (moveItemUpRecursive(item.navigationItems, item.key)) {
                        return true;
                    }
                }
            }
            return false;
        };

        moveItemUpRecursive(updatedArray, parentKey);

        await this.navigationService.updateNavigation(updatedArray);
        this.eventManager.dispatchEvent('onSaveChanges');

        this.loadNavigationItems();
    }

    moveItemDown = async (array: NavigationItemContract[], parentKey: string, itemKey: string): Promise<void> => {
        const updatedArray = JSON.parse(JSON.stringify(array)); // Create a deep copy of the array

        const moveItemDownRecursive = (items, parentKey) => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.key === itemKey) {
                    // Move the item down within its parent's navigationItems array
                    if (i < items.length - 1) {
                        [items[i], items[i + 1]] = [items[i + 1], items[i]];
                    }
                    return true;
                }

                if (item.navigationItems) {
                    // Recursively search in nested items
                    if (moveItemDownRecursive(item.navigationItems, item.key)) {
                        return true;
                    }
                }
            }
            return false;
        };

        moveItemDownRecursive(updatedArray, parentKey);

        await this.navigationService.updateNavigation(updatedArray);
        this.eventManager.dispatchEvent('onSaveChanges');

        this.loadNavigationItems();
    }

    checkItemPosition = (itemKey: string): ItemPosition => {
        const navItems = this.state.navigationItems;
        const parent = this.findNavItemByKey(navItems, this.findParentItemKey(navItems, itemKey));

        let isFirst = null;
        let isLast = null;

        if (!parent) {
            // Handle top-level items
            isFirst = navItems[0].key === itemKey;
            isLast = navItems[navItems.length - 1].key === itemKey;
        }

        if (parent && parent.navigationItems && parent.navigationItems.length > 0) {
            isFirst = parent.navigationItems[0].key === itemKey;
            isLast = parent.navigationItems[parent.navigationItems.length - 1].key === itemKey;
        }

        if (isFirst && isLast) {
            return ItemPosition.FIRST_AND_LAST;
        } else if (isFirst) {
            return ItemPosition.FIRST;
        } else if (isLast) {
            return ItemPosition.LAST;
        }

        return null;
    }

    renderNavItemContent = (navItem: INavLink): JSX.Element => {
        const itemPosition = this.checkItemPosition(navItem.key);

        return (
            <Stack horizontal horizontalAlign="space-between" className="nav-item-outer-stack">
                <Text className="nav-item-name">{navItem.name}</Text>
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }} className="nav-item-inner">
                    {(itemPosition !== ItemPosition.FIRST && itemPosition !== ItemPosition.FIRST_AND_LAST) &&
                        <FontIcon
                            iconName="ChevronUpMed"
                            title="Move up"
                            style={iconStyles}
                            onClick={(event) => {
                                event.stopPropagation();
                                this.moveItemUp(this.state.navigationItems, this.findParentItemKey(this.state.navigationItems, navItem.key), navItem.key)
                            }}
                        />
                    }
                    {(itemPosition !== ItemPosition.LAST && itemPosition !== ItemPosition.FIRST_AND_LAST) &&
                        <FontIcon
                            iconName="ChevronDownMed"
                            title="Move down"
                            style={iconStyles}
                            onClick={(event) => {
                                event.stopPropagation();
                                this.moveItemDown(this.state.navigationItems, this.findParentItemKey(this.state.navigationItems, navItem.key), navItem.key)
                            }}
                        />
                    }
                    <FontIcon
                        iconName="Settings"
                        title="Edit"
                        style={iconStyles}
                        onClick={(event) => {
                            event.stopPropagation();
                            this.setState({ showNavigationItemModal: true, currentNavItem: this.findNavItemByKey(this.state.navigationItems, navItem.key) })
                        }
                        }
                    />
                </Stack>
            </Stack>
        );
    }

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
                    <Text className="description-text">Manage and organize navigation of your developer portal. After you create a menu, you can add it to a page or layout with the "menu" widget.</Text>
                </Stack>
                <CommandBarButton
                    iconProps={addIcon}
                    text="Add item"
                    className="nav-item-list-button"
                    onClick={() => this.setState({ showNavigationItemModal: true, currentNavItem: null })}
                />
                {this.state.isLoading && <Spinner />}
                {this.state.navigationItemsToRender.length === 0 && !this.state.isLoading
                    ? <Text block className="nav-item-description-container">It seems that you don't have site menu items yet. Would you like to create one?</Text>
                    : 
                        <Nav
                            ariaLabel="Site menu"
                            groups={this.state.navigationItemsToRender}
                            onRenderLink={(item) => this.renderNavItemContent(item)}
                        />
                }
            </>
        </>
    }
}