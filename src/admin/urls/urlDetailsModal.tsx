import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IUrlService, UrlContract } from '@paperbits/common/urls';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { REQUIRED, URL, validateField } from '../utils/validator';

interface UrlDetailsModalState {
    url: UrlContract,
    showDeleteConfirmation: boolean
}

interface UrlDetailsModalProps {
    url: UrlContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const textFieldStyles = { root: { paddingBottom: 15 } };

export class UrlDetailsModal extends React.Component<UrlDetailsModalProps, UrlDetailsModalState> {
    @Resolve('urlService')
    public urlService: IUrlService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: UrlDetailsModalProps) {
        super(props);

        this.state = {
            url: this.props.url ?? { permalink: 'https://', title: 'New URL', description: '' },
            showDeleteConfirmation: false
        }
    }

    onInputChange = async (field: string, newValue: string) => {
        this.setState({
            url: {
                ...this.state.url,
                [field]: newValue
            }
        });
    }

    deleteUrl = async () => {
        await this.urlService.deleteUrl(this.state.url);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    saveUrl = async () => {
        if (this.props.url) {
            await this.urlService.updateUrl(this.state.url);
        } else {
            const newUrl = this.state.url;
            await this.urlService.createUrl(newUrl.permalink, newUrl.title, newUrl.description);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.url.title}
                    onConfirm={this.deleteUrl.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text block nowrap className="admin-modal-header-text">URL / { this.state.url.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveUrl()}
                            disabled={JSON.stringify(this.props.url) === JSON.stringify(this.state.url)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.url && 
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                            styles={{ root: { height: 44, marginBottom: 30 } }}
                        />
                    }
                    <TextField
                        label="Title"
                        value={this.state.url.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue)}
                        styles={textFieldStyles}
                        onGetErrorMessage={(value) => validateField(REQUIRED, value)}
                    />
                    <TextField
                        label="Permalink"
                        value={this.state.url.permalink}
                        onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                        styles={textFieldStyles}
                        onGetErrorMessage={(value) => validateField(URL, value)}
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.url.description}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                        styles={textFieldStyles}
                    />
                </div>
            </Modal>
        </>
    }
}