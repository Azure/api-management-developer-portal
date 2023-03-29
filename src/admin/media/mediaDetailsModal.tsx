import * as React from 'react';
import Cropper from 'react-cropper';
//import 'cropperjs/dist/cropper.css';
import { Resolve } from '@paperbits/react/decorators';
import { IMediaService } from '@paperbits/common/media';
import { MediaContract } from '@paperbits/common/media/mediaContract';
import { Router } from '@paperbits/common/routing';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';

interface MediaDetailsModalState {
    mediaItem: MediaContract,
    showDeleteConfirmation: boolean,
    copyPage: boolean
}

interface MediaDetailsModalProps {
    mediaItem: MediaContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

const textFieldStyles = { root: { paddingBottom: 15 } };

const cropperRef = React.createRef();

export class MediaDetailsModal extends React.Component<MediaDetailsModalProps, MediaDetailsModalState> {
    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('router')
    public router: Router;

    @Resolve('eventManager')
    public eventManager: EventManager;
    cropper: Cropper;

    constructor(props: MediaDetailsModalProps) {
        super(props);

        this.state = {
            mediaItem: this.props.mediaItem,
            showDeleteConfirmation: false,
            copyPage: false
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

    deleteFile = async () => {
        await this.mediaService.deleteMedia(this.state.mediaItem);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    savePage = async () => {
        // if (this.props.page && !this.state.copyPage) {
        //     await this.pageService.updatePage(this.state.page);
        // } else {
        //     const newPage = this.state.page;
        //     await this.pageService.createPage(newPage.permalink, newPage.title, newPage.description, newPage.keywords);
        // }

        // this.eventManager.dispatchEvent('onSaveChanges');
        // this.props.onDismiss();
    }

    onCrop = () => {
        // image in dataUrl
        console.log(this.cropper.getCroppedCanvas().toDataURL());
    }

    onCropperInit = (cropper) => {
        this.cropper = cropper;
    }


    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.mediaItem.fileName}
                    onConfirm={this.deleteFile.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal media-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Media / { this.state.mediaItem.fileName }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.savePage()}
                            disabled={JSON.stringify(this.props.mediaItem) === JSON.stringify(this.state.mediaItem)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <div className="media-details-wrapper">
                        
                    </div>
                    <Cropper
                        src={this.state.mediaItem.downloadUrl}
                        style={{ height: 400, width: "100%" }}
                        // Cropper.js options
                        //initialAspectRatio={16 / 9}
                        guides={false}
                        crop={this.onCrop.bind(this)}
                        onInitialized={this.onCropperInit.bind(this)}
                    />
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
                        //value={this.state.mediaItem.}
                        onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
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