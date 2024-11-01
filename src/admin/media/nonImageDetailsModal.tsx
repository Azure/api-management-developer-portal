import * as React from 'react';
import { isEqual, isEmpty, debounce } from 'lodash';
import { Resolve } from '@paperbits/react/decorators';
import { IMediaService } from '@paperbits/common/media';
import { MediaContract } from '@paperbits/common/media/mediaContract';
import { EventManager } from '@paperbits/common/events';
import { DefaultButton, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { CopyableTextField } from '../utils/components/copyableTextField';
import { REQUIRED, UNIQUE_REQUIRED, URL_REQUIRED, validateField } from '../utils/validator';
import { reservedPermalinks } from '../../constants';
import { MimeTypes } from '@paperbits/common';
import { getType } from "mime";

interface NonImageDetailsModalState {
    mediaItem: MediaContract,
    errors: object
}

interface NonImageDetailsModalProps {
    mediaItem: MediaContract,
    isLinking?: boolean,
    onDismiss: () => void
}

const textFieldStyles = { root: { paddingBottom: 15 } };

export class NonImageDetailsModal extends React.Component<NonImageDetailsModalProps, NonImageDetailsModalState> {
    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: NonImageDetailsModalProps) {
        super(props);

        this.state = {
            mediaItem: this.props.mediaItem,
            errors: {}
        }
    }

    onInputChange = async (field: string, newValue: string, validationType?: string): Promise<void> => {
        const newStateMediaItem: MediaContract = { ...this.state.mediaItem, [field]: newValue };

        if (field === 'downloadUrl') {
            const newMimeType: string = getType(newValue);
            if (newMimeType) {
                newStateMediaItem.mimeType = newMimeType;
            }
        }

        this.setState({ mediaItem: newStateMediaItem });
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

    onReferenceUrlChange = (): void => {
        if (!this.state.errors['downloadUrl'] && this.state.mediaItem.fileName === 'media.svg') {
            const newName = this.state.mediaItem.downloadUrl.split("/").pop();
            this.setState({
                mediaItem: {
                    ...this.state.mediaItem,
                    fileName: newName,
                    permalink: '/content/' + newName,
                    mimeType: MimeTypes.imageSvg
                }
            })
        }
    }

    validatePermalink = async (permalink: string): Promise<string> => {
        if (permalink === this.props.mediaItem?.permalink) return '';

        const isPermalinkNotDefined = permalink && !(await this.mediaService.getMediaByPermalink(permalink)) && !reservedPermalinks.includes(permalink);
        let errorMessage = validateField(UNIQUE_REQUIRED, permalink, isPermalinkNotDefined);

        if (errorMessage === '') errorMessage = validateField(URL_REQUIRED, permalink);

        return errorMessage;
    }

    saveMedia = async (): Promise<void> => {
        const permalinkError = await this.validatePermalink(this.state.mediaItem.permalink);
        if (permalinkError) {
            this.setState({ errors: { permalink: permalinkError } });

            return;
        }

        await this.mediaService.updateMedia(this.state.mediaItem);
        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
        return <>
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" block nowrap className="admin-modal-header-text">Media / { this.state.mediaItem.fileName }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveMedia()}
                            disabled={isEqual(this.props.mediaItem, this.state.mediaItem) || !isEmpty(this.state.errors)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={async () => {
                                if (this.props.isLinking) {
                                    await this.mediaService.deleteMedia(this.state.mediaItem);
                                    this.eventManager.dispatchEvent('onSaveChanges');
                                }
                                this.props.onDismiss();
                            }}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
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
                    {this.props.isLinking
                        ? <TextField
                            label="Reference URL"
                            value={this.state.mediaItem.downloadUrl}
                            onChange={(event, newValue) => this.onInputChange('downloadUrl', newValue, URL_REQUIRED)}
                            errorMessage={this.state.errors['downloadUrl'] ?? ''}
                            styles={textFieldStyles}
                            required
                            onBlur={() => this.onReferenceUrlChange()}
                        />
                        : <CopyableTextField
                            fieldLabel="Reference URL"
                            showLabel={true}
                            copyableValue={this.state.mediaItem.downloadUrl}
                        />
                    }
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
                </div>
            </Modal>
        </>
    }
}