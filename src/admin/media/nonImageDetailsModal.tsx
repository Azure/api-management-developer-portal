import * as React from 'react';
import * as Utils from '@paperbits/common/utils';
import { Resolve } from '@paperbits/react/decorators';
import { IMediaService } from '@paperbits/common/media';
import { MediaContract } from '@paperbits/common/media/mediaContract';
import { Router } from '@paperbits/common/routing';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IconButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField, TooltipDelay, TooltipHost } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { blob } from 'stream/consumers';
import { saveAs } from 'file-saver';

interface NonImageDetailsModalState {
    mediaItem: MediaContract,
    showDeleteConfirmation: boolean,
    urlCopied: boolean
}

interface NonImageDetailsModalProps {
    mediaItem: MediaContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

const textFieldStyles = { root: { paddingBottom: 15 } };

export class NonImageDetailsModal extends React.Component<NonImageDetailsModalProps, NonImageDetailsModalState> {
    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('router')
    public router: Router;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: NonImageDetailsModalProps) {
        super(props);

        this.state = {
            mediaItem: this.props.mediaItem,
            showDeleteConfirmation: false,
            urlCopied: false
        }
    }

    onInputChange = async (field: string, newValue: string) => {
        this.setState({
            mediaItem: {
                ...this.state.mediaItem,
                [field]: newValue
            }
        });
    }

    deleteMedia = async () => {
        await this.mediaService.deleteMedia(this.state.mediaItem);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    saveMedia = async () => {
        await this.mediaService.updateMedia(this.state.mediaItem);
        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }
    
    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.mediaItem.fileName}
                    onConfirm={this.deleteMedia.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Media / { this.state.mediaItem.fileName }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveMedia()}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <TextField
                        label="File name"
                        value={this.state.mediaItem.fileName}
                        onChange={(event, newValue) => this.onInputChange('fileName', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Permalink"
                        value={this.state.mediaItem.permalink}
                        onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Reference URL"
                        value={this.state.mediaItem.downloadUrl}
                        onChange={(event, newValue) => this.onInputChange('downloadUrl', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.mediaItem.description}
                        onChange={(event, newValue) => this.onInputChange('descriptiion', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Keywords"
                        placeholder="e.g. about"
                        value={this.state.mediaItem.keywords}
                        onChange={(event, newValue) => this.onInputChange('keywords', newValue)}
                    />
                </div>
            </Modal>
        </>
    }
}