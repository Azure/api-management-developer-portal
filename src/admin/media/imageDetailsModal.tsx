import * as React from 'react';
import Cropper from 'react-cropper';
//import 'cropperjs/dist/cropper.css';
import { isEqual, isEmpty, debounce } from 'lodash';
import * as Utils from '@paperbits/common/utils';
import { Resolve } from '@paperbits/react/decorators';
import { IMediaService, MediaContract } from '@paperbits/common/media';
import { EventManager } from '@paperbits/common/events';
import { ActionButton, DefaultButton, IconButton, Modal, PrimaryButton, Spinner, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { CopyableTextField } from '../utils/components/copyableTextField';
import { REQUIRED, UNIQUE_REQUIRED, URL_REQUIRED, validateField } from '../utils/validator';
import { reservedPermalinks } from '../../constants';

interface ImageDetailsModalState {
    mediaItem: MediaContract,
    showDeleteConfirmation: boolean,
    croppedImage: Object,
    dragMode: string,
    cropperDisabled: boolean,
    errors: object,
    isLoading: boolean
}

interface ImageDetailsModalProps {
    mediaItem: MediaContract,
    onDismiss: () => void
}

const textFieldStyles = { root: { paddingBottom: 15 } };
const cropperIconsStyles = { root: { color: '#000' } };
const flipVerticallyStyles = { root: { color: '#000', transform: 'rotate(-45deg)' } };
const flipHorizontallyStyles = { root: { color: '#000', transform: 'rotate(45deg)' } };

export class ImageDetailsModal extends React.Component<ImageDetailsModalProps, ImageDetailsModalState> {
    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    cropper: Cropper;

    constructor(props: ImageDetailsModalProps) {
        super(props);

        this.state = {
            mediaItem: this.props.mediaItem,
            showDeleteConfirmation: false,
            croppedImage: {},
            dragMode: 'crop',
            cropperDisabled: false,
            errors: {},
            isLoading: true
        }
    }

    onInputChange = async (field: string, newValue: string, validationType?: string): Promise<void> => {
        this.setState({
            mediaItem: {
                ...this.state.mediaItem,
                [field]: newValue
            }
        });

        this.runValidation(field, newValue, validationType);
    }

    runValidation = debounce(async (field: string, newValue: string, validationType?: string): Promise<void> => {
        let errorMessage = '';
        let errors = {};

        if (field === 'permalink') {
            errorMessage = await this.validatePermalink(newValue);
        } else if (validationType) {
            errorMessage = validateField(validationType, newValue);
        }

        if (errorMessage !== '' && !this.state.errors[field]) {
            errors = { ...this.state.errors, [field]: errorMessage };
        } else if (errorMessage === '' && this.state.errors[field]) {
            const { [field as keyof typeof this.state.errors]: error, ...rest } = this.state.errors;
            errors = rest;
        } else {
            errors = this.state.errors;
        }

        this.setState({ errors });
    }, 300)

    validatePermalink = async (permalink: string): Promise<string> => {
        if (permalink === this.props.mediaItem?.permalink) return '';

        const isPermalinkNotDefined = permalink && !(await this.mediaService.getMediaByPermalink(permalink)) && !reservedPermalinks.includes(permalink);
        let errorMessage = validateField(UNIQUE_REQUIRED, permalink, isPermalinkNotDefined);

        if (errorMessage === '') errorMessage = validateField(URL_REQUIRED, permalink);

        return errorMessage;
    }

    deleteMedia = async (): Promise<void> => {
        await this.mediaService.deleteMedia(this.state.mediaItem);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    saveMedia = async (): Promise<void> => {
        let file: Uint8Array;

        if (this.state.cropperDisabled) {
            this.cropper.getCroppedCanvas().toBlob(async blob => {
                file = await Utils.readFileAsByteArray(blob);
                await this.mediaService.updateMediaContent(this.state.mediaItem, file);
            });
        } else {
            await this.mediaService.updateMedia(this.state.mediaItem);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    onCropperInit = (cropper: Cropper): void => {
        this.cropper = cropper;
    }

    render(): JSX.Element {
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
                containerClassName="admin-modal media-details-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" block nowrap className="admin-modal-header-text">Media / { this.state.mediaItem.fileName }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveMedia()}
                            disabled={!isEmpty(this.state.errors) || (isEqual(this.props.mediaItem, this.state.mediaItem) && !this.state.cropperDisabled)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <Stack.Item style={{ width: '65%' }}>
                            {this.state.isLoading &&
                                <Spinner styles={{ root: {
                                    position: 'absolute',
                                    height: 450,
                                    width: 'calc(100% - 10px)',
                                    zIndex: 1
                                }}} />
                            }
                            <Cropper
                                src={this.state.mediaItem.downloadUrl}
                                onInitialized={this.onCropperInit.bind(this)}
                                style={{ height: 450 }}
                                guides={false}
                                responsive
                                restore
                                onLoad={() => this.setState({ isLoading: false })}
                            />
                            <Stack horizontal horizontalAlign="center" tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: 25 } }}>
                                <IconButton
                                    iconProps={{ iconName: 'Move', styles: cropperIconsStyles }}
                                    title="Drag mode - Move"
                                    ariaLabel="Drag mode - Move"
                                    onClick={() => {
                                        this.cropper.setDragMode('move');
                                        this.setState({ dragMode: 'move' });
                                    }}
                                    checked={this.state.dragMode === 'move'}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'Crop', styles: cropperIconsStyles }}
                                    title="Drag mode - Crop"
                                    ariaLabel="Drag mode - Crop"
                                    onClick={() => {
                                        this.cropper.setDragMode('crop');
                                        this.setState({ dragMode: 'crop' });
                                    }}
                                    checked={this.state.dragMode === 'crop'}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'ZoomIn', styles: cropperIconsStyles }}
                                    title="Zoom in"
                                    ariaLabel="Zoom in"
                                    onClick={() => this.cropper.zoom(0.1)}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'ZoomOut', styles: cropperIconsStyles }}
                                    title="Zoom out"
                                    ariaLabel="Zoom out"
                                    onClick={() => this.cropper.zoom(-0.1)}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'Rotate90CounterClockwise', styles: cropperIconsStyles }}
                                    title="Rotate counter clockwise"
                                    ariaLabel="Rotate counter clockwise"
                                    onClick={() => this.cropper.rotate(-90)}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'Rotate90Clockwise', styles: cropperIconsStyles }}
                                    title="Rotate clockwise"
                                    ariaLabel="Rotate clockwise"
                                    onClick={() => this.cropper.rotate(90)}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'FullScreen', styles: flipHorizontallyStyles }}
                                    title="Flip horizontally"
                                    ariaLabel="Flip horizontally"
                                    onClick={() => this.cropper.getData().scaleX == 1 ? this.cropper.scaleX(-1) : this.cropper.scaleX(1)}
                                    disabled={this.state.cropperDisabled}
                                />
                                <IconButton
                                    iconProps={{ iconName: 'FullScreen', styles: flipVerticallyStyles }}
                                    title="Flip vertically"
                                    ariaLabel="Flip vertically"
                                    onClick={() => this.cropper.getData().scaleY == 1 ? this.cropper.scaleY(-1) : this.cropper.scaleY(1)}
                                    disabled={this.state.cropperDisabled}
                                />
                            </Stack>
                            <Stack horizontalAlign="center">
                                <ActionButton
                                    text="Reset"
                                    ariaLabel="Reset"
                                    onClick={() => {
                                        this.cropper.enable();
                                        this.cropper.reset();
                                        this.setState({ cropperDisabled: false });
                                    }}
                                    styles={{ root: { width: 'fit-content', margin: '10px 0' }, label: { fontWeight: 600 } }}
                                />
                                <DefaultButton
                                    text="Apply edits"
                                    ariaLabel="Apply edits"
                                    onClick={() => {
                                        this.cropper.disable();
                                        this.setState({ cropperDisabled: true });
                                    }}
                                    styles={{ root: { width: 'fit-content' } }}
                                />
                            </Stack>
                        </Stack.Item>
                        <Stack.Item style={{ width: '35%' }}>
                            <TextField
                                label="File name"
                                value={this.state.mediaItem.fileName}
                                onChange={(event, newValue) => this.onInputChange('fileName', newValue, REQUIRED)}
                                errorMessage={this.state.errors['fileName'] ?? ''}
                                styles={textFieldStyles}
                                required
                            />
                            <TextField
                                label="Permalink"
                                value={this.state.mediaItem.permalink}
                                onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                                errorMessage={this.state.errors['permalink'] ?? ''}
                                styles={textFieldStyles}
                                required
                            />
                            <CopyableTextField
                                fieldLabel="Reference URL"
                                showLabel={true}
                                copyableValue={this.state.mediaItem.downloadUrl}
                            />
                            <TextField
                                label="Description"
                                multiline
                                autoAdjustHeight
                                value={this.state.mediaItem.description}
                                onChange={(event, newValue) => this.onInputChange('description', newValue)}
                                styles={textFieldStyles}
                            />
                            <TextField
                                label="Keywords"
                                placeholder="e.g. about"
                                value={this.state.mediaItem.keywords}
                                onChange={(event, newValue) => this.onInputChange('keywords', newValue)}
                            />
                        </Stack.Item>
                    </Stack>
                </div>
            </Modal>
        </>
    }
}