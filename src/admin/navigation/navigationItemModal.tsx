import * as React from 'react';
import * as Utils from '@paperbits/common';
import { INavigationService, NavigationItemContract } from '@paperbits/common/navigation';
import { IPageService } from '@paperbits/common/pages';
import { IUrlService } from '@paperbits/common/urls';
import { IMediaService, MediaContract } from '@paperbits/common/media';
import { EventManager } from '@paperbits/common/events';
import { Query } from '@paperbits/common/persistence';
import { Resolve } from '@paperbits/react/decorators';
import { AnchorUtils } from '@paperbits/core/text/anchorUtils';
import { ChoiceGroup, CommandBarButton, DefaultButton, Dropdown, IChoiceGroupOption, IDropdownOption, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { MediaSelectionItemModal } from '../media/mediaSelectionItemModal';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { REQUIRED, URL, validateField } from '../utils/validator';
import { lightTheme } from '../utils/themes';
import { ToastNotification } from '../utils/components/toastNotification';

interface NavigationItemModalState {
    selectedLinkOption: string,
    selectedUrlType: string,
    navItem: NavigationItemContract,
    navItemsDropdown: IDropdownOption[],
    showDeleteConfirmation: boolean,
    showMediaSelectionModal: boolean,
    pageDropdownOptions: IDropdownOption[],
    anchorDropdownOptions: IDropdownOption[],
    urlDropdownOptions: IDropdownOption[],
    selectedPage: string,
    selectedAnchor: string,
    selectedUrl: string,
    selectedMedia: MediaContract,
    targetWindow: string,
    parentItem: string
}

interface NavigationItemModalProps {
    navItem: NavigationItemContract,
    navItems: NavigationItemContract[],
    onDelete: () => void,
    onDismiss: () => void
}

const enum LinkOptionKey {
    NoLink = 'noLink',
    Page = 'page',
    Anchor = 'anchor',
    Url = 'url',
    SavedUrl = 'savedUrl',
    NewUrl = 'newUrl',
    Media = 'media'
}

const enum LinkActionOptionKey {
    Download = '_download',
    Self = '_self',
    Blank = '_blank'
}

const linkOptions: IDropdownOption[] = [
    { key: LinkOptionKey.NoLink, text: 'No link' },
    { key: LinkOptionKey.Page, text: 'Page' },
    { key: LinkOptionKey.Anchor, text: 'Anchor' },
    { key: LinkOptionKey.Url, text: 'URL' },
    { key: LinkOptionKey.Media, text: 'Media' }
];

const urlTypeOptions: IChoiceGroupOption[] = [
    { key: LinkOptionKey.SavedUrl, text: 'Saved URL', styles: { field: { padding: 0 }} },
    { key: LinkOptionKey.NewUrl, text: 'New URL', styles: { field: { padding: 0 }} }
];

const mediaLinkActionOptions: IChoiceGroupOption[] = [
    { key: LinkActionOptionKey.Download, text: 'Download file', styles: { field: { padding: 0 }} },
    { key: LinkActionOptionKey.Self, text: 'Open in the same window', styles: { field: { padding: 0 }} },
    { key: LinkActionOptionKey.Blank, text: 'Open in a new window', styles: { field: { padding: 0 }} }
];

const nonMediaLinkActionOptions: IChoiceGroupOption[] = mediaLinkActionOptions.filter(option => option.key !== LinkActionOptionKey.Download);

const deleteIcon: IIconProps = { iconName: 'Delete' };

export class NavigationItemModal extends React.Component<NavigationItemModalProps, NavigationItemModalState> {
    @Resolve('navigationService')
    public navigationService: INavigationService;

    @Resolve('pageService')
    public pageService: IPageService;

    @Resolve('urlService')
    public urlService: IUrlService;

    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: NavigationItemModalProps) {
        super(props);

        this.state = {
            selectedLinkOption: LinkOptionKey.NoLink,
            selectedUrlType: LinkOptionKey.SavedUrl,
            navItem: this.props.navItem ?? { key: '', label: 'New site menu item', targetWindow: LinkActionOptionKey.Self },
            navItemsDropdown: [],
            showDeleteConfirmation: false,
            showMediaSelectionModal: false,
            pageDropdownOptions: [],
            anchorDropdownOptions: [],
            urlDropdownOptions: [],
            selectedPage: '',
            selectedAnchor: '',
            selectedUrl: '',
            selectedMedia: null,
            targetWindow: LinkActionOptionKey.Self,
            parentItem: ''
        }
    }

    componentDidMount(): void {
        this.processPagesForDropdown();
        this.processUrlsForDropdown();
        this.setState({ navItemsDropdown: this.processNavItemsForDropdown(this.props.navItems, [{ key: '', text: 'None' }]) });
        if (this.props.navItem) this.processNavItem();
    }

    onInputChange = async (field: string, newValue: string): Promise<void> => {
        this.setState({
            navItem: {
                ...this.state.navItem,
                [field]: newValue
            }
        });
    }

    selectMedia = (mediaItem: MediaContract): void => {
        this.setState({ selectedMedia: mediaItem, showMediaSelectionModal: false });
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    closeMediaSelection = (): void => {
        this.setState({ showMediaSelectionModal: false });
    }

    processNavItem = async (): Promise<void> => {
        const navItem = this.props.navItem;
        let page = '';
        let anchor = '';
        let url = '';
        let media = null;
        let selectedLinkType = LinkOptionKey.NoLink;

        if (navItem.targetKey) {
            const targetType = navItem.targetKey?.split('/')[0];
            if (navItem.anchor) {
                page = navItem.targetKey;
                anchor = navItem.anchor;
                selectedLinkType = LinkOptionKey.Anchor;
                this.processAnchorsForDropdown(navItem.targetKey);
            } else if (targetType === 'pages') {
                page = navItem.targetKey;
                selectedLinkType = LinkOptionKey.Page;
            } else if (targetType === 'urls') {
                url = navItem.targetKey;
                selectedLinkType = LinkOptionKey.Url;
            } else {
                selectedLinkType = LinkOptionKey.Media;
                media = await this.mediaService.getMediaByKey(navItem.targetKey);
            }
        }

        this.setState({
            selectedPage: page,
            selectedAnchor: anchor,
            selectedUrl: url,
            selectedMedia: media,
            selectedLinkOption: selectedLinkType,
            targetWindow: navItem.targetWindow ?? (media ? LinkActionOptionKey.Download : LinkActionOptionKey.Self),
            parentItem: this.findParentItemKey(this.props.navItems, navItem.key)
        });
    }

    processPagesForDropdown = async (): Promise<void> => {
        const query = Query.from().orderBy('title');
        const pagesSearchResult = await this.pageService.search(query);

        const dropdownItems = [];

        pagesSearchResult.value.forEach(page => {
            dropdownItems.push({
                key: page.key,
                text: page.title
            });
        });

        this.setState({ pageDropdownOptions: dropdownItems });
    }

    processAnchorsForDropdown = async (pageKey: string): Promise<void> => {
        const pageContent = await this.pageService.getPageContent(pageKey);
        const children = AnchorUtils.getHeadingNodes(pageContent, 1, 6);

        const dropdownItems = [];

        children.filter(anchor => anchor.nodes?.length > 0)
            .forEach(anchor => {
                dropdownItems.push({
                    key: anchor.identifier || anchor.attrs?.key,
                    text: anchor.nodes[0]?.text
                });
            });

        this.setState({ anchorDropdownOptions: dropdownItems });
    }

    processUrlsForDropdown = async (): Promise<void> => {
        const query = Query.from().orderBy('title');
        const urlsSearchResult = await this.urlService.search(query);

        const dropdownItems = [];

        urlsSearchResult.value.forEach(url => {
            dropdownItems.push({
                key: url.key,
                text: url.title
            });
        });

        this.setState({ urlDropdownOptions: dropdownItems });
    }

    processNavItemsForDropdown = (navItems: NavigationItemContract[], dropdownItems: IDropdownOption[], currentNodeLabel: string = ''): IDropdownOption[] => {
        navItems.forEach(navItem => {
            const newNodeText = currentNodeLabel ? currentNodeLabel + '/' + navItem.label : navItem.label;

            dropdownItems.push({
                key: navItem.key,
                text: newNodeText
            });
            
            if (navItem.navigationItems) this.processNavItemsForDropdown(navItem.navigationItems, dropdownItems, newNodeText);
        });

        return dropdownItems;
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

    addNewItem = (array: NavigationItemContract[], parent: string, newObject: NavigationItemContract): NavigationItemContract[] => {
        if (parent === '') {
            array.push(newObject);

            return array;
        }

        return array.map(obj => {
            if (obj.key === parent) {
                if (obj.navigationItems && Array.isArray(obj.navigationItems)) {
                    obj.navigationItems.push(newObject);
                } else {
                    obj.navigationItems = [newObject];
                }
            }

            if (obj.navigationItems && obj.navigationItems.length > 0) {
                const modifiedItems = this.addNewItem(obj.navigationItems, parent, newObject);
                return { ...obj, navigationItems: modifiedItems };
            }

            return obj;
        });
    }

    updateItem = (array: NavigationItemContract[], key: string, updates: NavigationItemContract): NavigationItemContract[] => {
        return array.map(obj => {
            if (obj.key === key) {
                return { ...obj, ...updates };
            }

            if (obj.navigationItems && obj.navigationItems.length > 0) {
                const updatedItems = this.updateItem(obj.navigationItems, key, updates);
                return { ...obj, navigationItems: updatedItems };
            }

            return obj;
        });
    }

    moveItemToNewParent = (array: NavigationItemContract[], itemKey: string, newParentKey: string, updates: NavigationItemContract): NavigationItemContract[] => {
        const updatedArray = JSON.parse(JSON.stringify(array)); // deep copy

        const moveItemRecursive = (items: NavigationItemContract[]): boolean => {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.key === itemKey) {
                    items.splice(i, 1); // remove from current parent

                    const updatedItem = { ...item, ...updates }; // updated item

                    if (!newParentKey) {
                        // If newParentKey is not provided, move the item to the top level
                        updatedArray.push(updatedItem);
                    } else {
                        const newParent = updatedArray.find(obj => obj.key === newParentKey);
                        if (newParent && newParent.navigationItems) {
                            newParent.navigationItems.push(updatedItem);
                        }
                    }

                    return true;
                }

                if (item.navigationItems) {
                    if (moveItemRecursive(item.navigationItems)) {
                        return true;
                    }
                }
            }

            return false;
        };

        moveItemRecursive(updatedArray);

        return updatedArray;
    }

    saveItem = async (): Promise<void> => {
        let updatedNavigation: NavigationItemContract[] = this.props.navItems;
        let newUrlKey = null;

        if (this.state.selectedLinkOption === LinkOptionKey.NewUrl) {
            const newUrl = await this.urlService.createUrl(this.state.navItem[LinkOptionKey.NewUrl], this.state.navItem[LinkOptionKey.NewUrl]);
            newUrlKey = newUrl.key;
        }

        if (this.props.navItem) {
            const updatedValues: NavigationItemContract = {
                key: this.props.navItem.key,
                label: this.state.navItem.label,
            }

            if (this.props.navItem.targetKey || this.state.selectedLinkOption !== LinkOptionKey.NoLink) {
                if (this.state.selectedLinkOption === LinkOptionKey.Anchor) {
                    updatedValues.targetKey = this.state.navItem[LinkOptionKey.Page];
                    updatedValues.anchor = this.state.navItem.anchor;
                } else {
                    updatedValues.targetKey = newUrlKey ?? this.state.selectedMedia?.key ?? this.state.navItem[this.state.selectedLinkOption];
                }

                updatedValues.targetWindow = this.state.targetWindow;

            }

            if (this.state.parentItem !== this.state.navItem['parent']) {
                updatedValues.navigationItems = this.props.navItem.navigationItems;

                updatedNavigation = this.moveItemToNewParent(this.props.navItems, this.props.navItem.key, this.state.navItem['parent'], updatedValues);
            } else {
                updatedNavigation = this.updateItem(this.props.navItems, this.props.navItem.key, updatedValues);
            }
        } else {
            const newNavItem: NavigationItemContract = {
                key: Utils.guid(),
                label: this.state.navItem.label,
                navigationItems: null
            }

            if (this.state.selectedLinkOption !== LinkOptionKey.NoLink) {
                if (this.state.selectedLinkOption === LinkOptionKey.Anchor) {
                    newNavItem.targetKey = this.state.navItem[LinkOptionKey.Page];
                    newNavItem.anchor = this.state.navItem.anchor;
                } else {
                    newNavItem.targetKey = newUrlKey ?? this.state.selectedMedia?.key ?? this.state.navItem[this.state.selectedLinkOption];
                }

                newNavItem.targetWindow = this.state.targetWindow;
            }

            updatedNavigation = this.addNewItem(this.props.navItems, this.state.navItem['parent'] ?? '', newNavItem);
        }

        await this.navigationService.updateNavigation(updatedNavigation);
        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.navItem.label}
                    onConfirm={this.props.onDelete}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            {this.state.showMediaSelectionModal &&
                <MediaSelectionItemModal
                    selectMedia={this.selectMedia.bind(this)}
                    onDismiss={this.closeMediaSelection.bind(this)}
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text" block nowrap>Site menu item / { this.state.navItem.label }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveItem()}
                            disabled={JSON.stringify(this.props.navItem) === JSON.stringify(this.state.navItem)}
                        />
                        <DefaultButton text="Discard" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.navItem && 
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                            styles={{ root: { height: 44, marginBottom: 30 } }}
                        />
                    }
                    <TextField
                        label="Name"
                        value={this.state.navItem ? this.state.navItem.label : 'New link item'}
                        placeholder="i.e. Orders"
                        onChange={(event, newValue) => this.onInputChange('label', newValue)}
                        styles={{ root: { paddingBottom: 15 } }}
                        onGetErrorMessage={(value) => validateField(REQUIRED, value)}
                    />

                    <Dropdown
                        label="Link to"
                        options={linkOptions}
                        selectedKey={this.state.selectedLinkOption}
                        onChange={(event, option) => {
                            this.setState({ 
                                selectedLinkOption: option.key.toString(),
                                targetWindow: option.key === LinkOptionKey.Media ? LinkActionOptionKey.Download : LinkActionOptionKey.Self
                            });
                            if (option.key.toString() === LinkOptionKey.Anchor && this.state.selectedPage !== '') {
                                this.processAnchorsForDropdown(this.state.selectedPage);
                            }
                    }}
                        styles={{ root: { paddingBottom: 15 } }}
                    />

                    {(this.state.selectedLinkOption === LinkOptionKey.Page || this.state.selectedLinkOption === LinkOptionKey.Anchor) &&
                        <Dropdown
                            label="Select page"
                            placeholder="Click to select a page..."
                            options={this.state.pageDropdownOptions}
                            defaultSelectedKey={this.state.selectedPage}
                            onChange={(event, option) => {
                                this.setState({ selectedPage: option.key.toString() });
                                this.processAnchorsForDropdown(option.key.toString());
                                this.onInputChange(LinkOptionKey.Page, option.key.toString());
                            }}
                            styles={{ root: { paddingBottom: 15 } }}
                        />
                    }

                    {this.state.selectedLinkOption === LinkOptionKey.Anchor && 
                        (
                            (this.state.selectedPage !== '' && this.state.anchorDropdownOptions.length === 0) 
                                ?
                                    <Text 
                                        block 
                                        styles={{ root: { paddingBottom: 15, color: lightTheme.callingPalette.callRed } }}
                                    >
                                        There are no anchors on this page, please, select another page or select "Page" as a "Link to" option.
                                    </Text>
                                : 
                                    this.state.anchorDropdownOptions.length > 0 &&
                                        <Dropdown
                                            label="Select anchor"
                                            placeholder="Click to select an anchor..."
                                            options={this.state.anchorDropdownOptions}
                                            defaultSelectedKey={this.state.selectedAnchor}
                                            onChange={(event, option) => this.onInputChange(LinkOptionKey.Anchor, option.key.toString())}
                                            styles={{ root: { paddingBottom: 15 } }}
                                        />
                        )
                    }

                    {this.state.selectedLinkOption === LinkOptionKey.Url && 
                        <ChoiceGroup
                            label="Select method"
                            options={urlTypeOptions}
                            selectedKey={this.state.selectedUrlType}
                            onChange={(event, option) => this.setState({ selectedUrlType: option.key })}
                            styles={{ root: { paddingBottom: 15 } }}
                        />
                    }

                    {(this.state.selectedLinkOption === LinkOptionKey.Url && this.state.selectedUrlType === LinkOptionKey.SavedUrl) &&
                        <Dropdown
                            label="Select URL"
                            placeholder="Click to select an existing URL..."
                            options={this.state.urlDropdownOptions}
                            defaultSelectedKey={this.state.selectedUrl}
                            onChange={(event, option) => this.onInputChange(LinkOptionKey.SavedUrl, option.key.toString())}
                            styles={{ root: { paddingBottom: 15 } }}
                        />
                    }

                    {(this.state.selectedLinkOption === LinkOptionKey.Url && this.state.selectedUrlType === LinkOptionKey.NewUrl) &&
                        <TextField
                            label="Enter new URL"
                            placeholder="Enter a new URL"
                            styles={{ root: { paddingBottom: 15 } }}
                            onChange={(event, newValue) => this.onInputChange(LinkOptionKey.NewUrl, newValue)}
                            value={this.state.navItem?.[LinkOptionKey.NewUrl] ?? 'https://'}
                            onGetErrorMessage={(value) => validateField(URL, value)}
                        />
                    }

                    {this.state.selectedLinkOption === LinkOptionKey.Media &&
                        <>
                            {this.state.selectedMedia && <Text block styles={{ root: { paddingBottom: 15, fontWeight: 'bold' } }}>{this.state.selectedMedia.fileName}</Text>}
                            <DefaultButton
                                text={`Select ${this.state.selectedMedia ? 'another ' : ''}file`}
                                onClick={() => this.setState({ showMediaSelectionModal: true })}
                                styles={{ root: { marginBottom: 15 } }}
                            />
                        </>
                    }
                    
                    <Dropdown
                        label="Site menu item parent"
                        placeholder="Click to select a parent..."
                        options={this.state.navItemsDropdown}
                        defaultSelectedKey={this.state.parentItem}
                        onChange={(event, option) => this.onInputChange('parent', option.key.toString())}
                        styles={{ root: { paddingBottom: 15 } }}
                    />
                    <ChoiceGroup
                        label="Link actions"
                        options={this.state.selectedLinkOption === LinkOptionKey.Media ? mediaLinkActionOptions : nonMediaLinkActionOptions}
                        selectedKey={this.state.targetWindow}
                        onChange={(event, option) => this.setState({ targetWindow: option.key })}
                    />
                </div>
            </Modal>
        </>
    }
}