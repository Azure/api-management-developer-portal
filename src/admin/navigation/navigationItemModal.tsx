import * as React from 'react';
import { INavigationService } from '@paperbits/common/navigation';
import { NavigationItemContract } from '@paperbits/common/navigation/navigationItemContract';
import { Resolve } from '@paperbits/react/decorators';
import { IIconProps, Stack, Modal, Text, INavLink, Dropdown, IDropdownOption, Callout, DirectionalHint, Pivot, PivotItem } from '@fluentui/react';
import { TextField } from '@fluentui/react/lib/TextField';
import { CommandBarButton, DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';

interface NavigationItemModalState {
    navItem: INavLink,
    navItemsDropdown: IDropdownOption[],
    showDeleteConfirmation: boolean,
    showLinkToCallout: boolean
}

interface NavigationItemModalProps {
    navItem: INavLink,
    navItems: NavigationItemContract[],
    onSave: () => void,
    onDelete: () => void,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const linkIcon: IIconProps = { iconName: 'Link12' };

export class NavigationItemModal extends React.Component<NavigationItemModalProps, NavigationItemModalState> {
    @Resolve('navigationService')
    public navigationService: INavigationService;

    constructor(props: NavigationItemModalProps) {
        super(props);

        this.state = {
            navItem: this.props.navItem,
            navItemsDropdown: [],
            showDeleteConfirmation: false,
            showLinkToCallout: false
        }
    }

    componentDidMount(): void {
        this.setState({ navItemsDropdown: this.processNavItemsForDropdown(this.props.navItems, [{ key: '', text: 'None' }]) });
    }

    onInputChange = async (field: string, newValue: string) => {
        this.setState({
            navItem: {
                ...this.state.navItem,
                [field]: newValue
            }
        });
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

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.navItem.name}
                    onConfirm={this.props.onDelete}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                //titleAriaId={titleId}
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="nav-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="nav-modal-header">
                    <Text className="nav-modal-header-text">Navigation item {this.state.navItem && `/ ` + this.state.navItem.name }</Text>
                    <Stack horizontal gap={20}>
                        <PrimaryButton text="Save" />
                        <DefaultButton text="Discard" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="nav-modal-content">
                    {this.props.navItem && 
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                            styles={{ root: { height: 44, marginBottom: 30 } }}
                        />
                    }
                    <TextField
                        label="Label"
                        value={this.state.navItem ? this.state.navItem.name : '< New >'}
                        placeholder="i.e. Orders"
                        onChange={(event, newValue) => this.onInputChange('name', newValue)}
                        styles={{ root: { paddingBottom: 15 } }}
                    />
                    <TextField
                        id="link-to-field"
                        label="Link to"
                        iconProps={linkIcon}
                        placeholder="Click to select a link..."
                        value={this.state.navItem ? this.state.navItem.targetKey : ''}
                        styles={{ root: { paddingBottom: 15 } }}
                        onClick={() => this.setState({ showLinkToCallout: true })}
                    />
                    {this.state.showLinkToCallout && 
                        <Callout
                            target="#link-to-field"
                            role="dialog"
                            directionalHint={DirectionalHint.bottomCenter}
                        >
                            <Pivot>
                                <PivotItem itemIcon="Page" ariaLabel="Pages">
                                    
                                </PivotItem>
                                <PivotItem itemIcon="PhotoVideoMedia" ariaLabel="Media"></PivotItem>
                                <PivotItem itemIcon="Link" ariaLabel="Web URL"></PivotItem>
                            </Pivot>
                        </Callout>
                    }
                    <Dropdown
                        label="Parent item"
                        placeholder="Click to select a parent..."
                        options={this.state.navItemsDropdown}
                    />
                </div>
            </Modal>
        </>
    }
}