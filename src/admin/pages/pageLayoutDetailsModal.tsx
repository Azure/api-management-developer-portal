import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';

interface PageLayoutModalState {
    layout: LayoutContract,
    showDeleteConfirmation: boolean,
    copyLayout: boolean
}

interface PageLayoutModalProps {
    layout: LayoutContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

const textFieldStyles = { root: { paddingBottom: 15 } };

export class PageLayoutDetailsModal extends React.Component<PageLayoutModalProps, PageLayoutModalState> {
    @Resolve('layoutService')
    public layoutService: ILayoutService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: PageLayoutModalProps) {
        super(props);

        this.state = {
            layout: this.props.layout ?? { permalinkTemplate: '/new-layout', title: 'New layout' },
            showDeleteConfirmation: false,
            copyLayout: false
        }
    }

    onInputChange = async (field: string, newValue: string) => {
        this.setState({
            layout: {
                ...this.state.layout,
                [field]: newValue
            }
        })
    }

    deleteLayout = async () => {
        await this.layoutService.deleteLayout(this.state.layout);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    copyLayout = async () => {
        this.setState({ copyLayout: true, layout: {
            ...this.state.layout,
            permalinkTemplate: null,
            title: this.state.layout.title + ' (copy)'
        }});
    }

    saveLayout = async () => {
        if (this.props.layout && !this.state.copyLayout) {
            await this.layoutService.updateLayout(this.state.layout);
        } else {
            const newLayout = this.state.layout;
            await this.layoutService.createLayout(newLayout.title, newLayout.description, newLayout.permalinkTemplate);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.layout.title}
                    onConfirm={this.deleteLayout.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Layout / { this.state.layout.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveLayout()}
                            disabled={JSON.stringify(this.props.layout) === JSON.stringify(this.state.layout)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.layout && this.props.layout.permalinkTemplate !== '/' &&
                        <>
                            <CommandBarButton
                                iconProps={deleteIcon}
                                text="Delete"
                                onClick={() => this.setState({ showDeleteConfirmation: true })}
                                styles={{ root: { height: 44, marginBottom: 30 } }}
                            />
                            <CommandBarButton
                                iconProps={copyIcon}
                                text="Copy layout"
                                onClick={() => this.copyLayout()}
                            />
                        </>
                    }
                    <TextField
                        label="Title"
                        value={this.state.layout.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Permalink template"
                        value={this.state.layout.permalinkTemplate}
                        disabled={this.props.layout?.permalinkTemplate === '/' ? true : false}
                        onChange={(event, newValue) => this.onInputChange('permalinkTemplate', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.layout.description}
                        onChange={(event, newValue) => this.onInputChange('descriptiion', newValue)}
                    />
                </div>
            </Modal>
        </>
    }
}