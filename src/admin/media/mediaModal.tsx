import * as React from 'react';
import { saveAs } from 'file-saver';
import * as Utils from '@paperbits/common/utils';
import { Resolve } from '@paperbits/react/decorators';
import { EventManager } from '@paperbits/common/events';
import { ViewManager } from '@paperbits/common/ui';
import { IMediaService } from '@paperbits/common/media';
import { MediaContract } from '@paperbits/common/media/mediaContract';
import { MimeTypes } from '@paperbits/common';
import { Checkbox, DefaultButton, IconButton, IIconProps, Image, ImageFit, IOverflowSetItemProps, Link, Modal, OverflowSet, SearchBox, Spinner, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { createSearchQuery, getAllValues, getThumbnailUrl } from '../utils/helpers';
import { ImageDetailsModal } from './imageDetailsModal';
import { NonImageDetailsModal } from './nonImageDetailsModal';

interface MediaModalState {
    media: MediaContract[],
    selectedFiles: MediaContract[],
    selectedMediaFile: MediaContract,
    fileForRename: string,
    fileNewName: string,
    showImageDetailsModal: boolean,
    showNonImageDetailsModal: boolean,
    showDeleteConfirmation: boolean,
    isLinking: boolean,
    isLoading: boolean
}

interface MediaModalProps {
    onDismiss: () => void
}

const uploadIcon: IIconProps = { iconName: 'Upload' };
const linkIcon: IIconProps = { iconName: 'Link' };
const editIcon: IIconProps = { iconName: 'Edit' };
const deleteIcon: IIconProps = { iconName: 'Delete' };

export class MediaModal extends React.Component<MediaModalProps, MediaModalState> {
    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('eventManager')
    public eventManager: EventManager;
    
    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: MediaModalProps) {
        super(props);

        this.state = {
            media: [],
            selectedFiles: [],
            selectedMediaFile: null,
            fileForRename: '',
            fileNewName: '',
            showImageDetailsModal: false,
            showNonImageDetailsModal: false,
            showDeleteConfirmation: false,
            isLinking: false,
            isLoading: false
        }
    }

    componentDidMount(): void {
        this.searchMedia();
    }

    searchMedia = async (searchPattern: string = ''): Promise<void> => {
        this.setState({ isLoading: true });
        const query = createSearchQuery(searchPattern, 'fileName');
        const mediaSearchResult = await this.mediaService.search(query);
        const allMedia = await getAllValues(mediaSearchResult, mediaSearchResult.value);
        this.setState({ media: allMedia, isLoading: false });
    }

    selectMedia = (file: MediaContract, checked: boolean): void => {
        if (checked) {
            this.setState({ selectedFiles: [...this.state.selectedFiles, file] });
        } else {
            this.setState({ selectedFiles: this.state.selectedFiles.filter(media => media.key !== file.key) });
        }
    }

    uploadMedia = async (): Promise<void> => {
        const files = await this.viewManager.openUploadDialog();

        await Promise.all(files.map(async file => {
            const content = await Utils.readFileAsByteArray(file);
            await this.mediaService.createMedia(file.name, content, file.type);
        }));

        this.eventManager.dispatchEvent('onSaveChanges');
        this.searchMedia();
    }

    linkMedia = async (): Promise<void> => {
        const newMediaFile = await this.mediaService.createMediaUrl('media.svg', 'https://cdn.paperbits.io/images/logo.svg', MimeTypes.imageSvg);
        this.setState({ selectedMediaFile: newMediaFile, showNonImageDetailsModal: true, isLinking: true });
    }

    deleteMedia = async (): Promise<void> => {
        // TODO: check if can be replaced with map loop instead. for loop is used because BE is not deleting it properly
        for (const file of this.state.selectedFiles) {
            await this.mediaService.deleteMedia(file);
        }
    
        this.setState({ selectedFiles: [], showDeleteConfirmation: false });
        this.eventManager.dispatchEvent('onSaveChanges');
        this.searchMedia();
    }

    renameMedia = async (mediaItem: MediaContract): Promise<void> => {
        if (this.state.fileNewName) {
            const updatedMedia: MediaContract = {
                ...mediaItem,
                fileName: this.state.fileNewName
            }
            await this.mediaService.updateMedia(updatedMedia);
            this.eventManager.dispatchEvent('onSaveChanges');
        }

        this.setState({ fileForRename: '', fileNewName: '' });
        this.searchMedia();
    }

    onRenderItem = (item: IOverflowSetItemProps): JSX.Element => (
        <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
            {item.name}
        </Link>
    );
      
    onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
        return (
            <IconButton
                title="More options"
                menuIconProps={{ iconName: 'More' }}
                menuProps={{ items: overflowItems! }}
            />
        );
    };

    openEditModal = (mediaItem: MediaContract, thumbnailUrl: string, blobKey: string): void => {
        thumbnailUrl && blobKey
            ? this.setState({ selectedMediaFile: mediaItem, showImageDetailsModal: true })
            : this.setState({ selectedMediaFile: mediaItem, showNonImageDetailsModal: true })
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    renderMediaItem = (mediaItem: MediaContract): JSX.Element => {
        const thumbnailUrl: string = getThumbnailUrl(mediaItem);
        
        return (
            <div className="media-box" key={mediaItem.key}>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Checkbox
                        ariaLabel="Select media file"
                        onChange={(event, checked) => this.selectMedia(mediaItem, checked)}
                        checked={!!this.state.selectedFiles.find(file => mediaItem.key === file.key)}
                    />
                    <IconButton iconProps={editIcon} title="Edit media file" onClick={() => this.openEditModal(mediaItem, thumbnailUrl, mediaItem.blobKey)} />
                </Stack>
                <Image
                    src={thumbnailUrl ?? '/assets/images/no-preview.png'}
                    alt={mediaItem.fileName}
                    imageFit={ImageFit.centerCover}
                    styles={{ root: { flexGrow: 1, marginTop: 10, marginBottom: 20 } }}
                    shouldStartVisible
                />
                {this.state.fileForRename === mediaItem.key
                    ?
                        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                            <TextField
                                ariaLabel="Rename file"
                                defaultValue={mediaItem.fileName}
                                onChange={(event, newValue) => this.setState({ fileNewName: newValue })}
                            />
                            <IconButton
                                iconProps={{ iconName: 'CheckMark' }}
                                onClick={() => this.renameMedia(mediaItem)}
                                disabled={this.state.fileNewName === ''}
                            />
                            <IconButton
                                iconProps={{ iconName: 'Cancel' }}
                                onClick={() => this.setState({ fileForRename: '', fileNewName: '' })}
                            />
                        </Stack>
                    :
                        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                            <Text>{mediaItem.fileName}</Text>
                            <OverflowSet
                                aria-label="Image actions"
                                overflowItems={[
                                    {
                                        key: 'edit',
                                        name: 'Edit',
                                        onClick: () => this.openEditModal(mediaItem, thumbnailUrl, mediaItem.blobKey)
                                    },
                                    {
                                        key: 'download',
                                        name: 'Download',
                                        onClick: () => saveAs(mediaItem.downloadUrl, mediaItem.fileName, { type: mediaItem.mimeType })
                                    },
                                    {
                                        key: 'rename',
                                        name: 'Rename',
                                        onClick: () => this.setState({ fileForRename: mediaItem.key })
                                    },
                                    {
                                        key: 'delete',
                                        name: 'Delete',
                                        onClick: () => this.setState({ selectedFiles: [mediaItem], showDeleteConfirmation: true })
                                    }
                                ]}
                                onRenderOverflowButton={this.onRenderOverflowButton}
                                onRenderItem={this.onRenderItem}
                            />
                        </Stack>
                }
            </div>
        );
    }

    render(): JSX.Element {
        return <>
            {this.state.showImageDetailsModal &&
                <ImageDetailsModal
                    mediaItem={this.state.selectedMediaFile}
                    onDismiss={() => {
                        this.setState({ showImageDetailsModal: false });
                        this.searchMedia();
                    }}
                />
            }
            {this.state.showNonImageDetailsModal &&
                <NonImageDetailsModal
                    mediaItem={this.state.selectedMediaFile}
                    isLinking={this.state.isLinking}
                    onDismiss={() => {
                        this.setState({ showNonImageDetailsModal: false, isLinking: false });
                        this.searchMedia();
                    }}
                />
            }
            {this.state.showDeleteConfirmation &&
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.selectedFiles.length === 1 ? this.state.selectedFiles[0].fileName : 'selected files'}
                    onConfirm={this.deleteMedia.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal media-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" className="admin-modal-header-text">Media</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <DefaultButton text="Close" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <Text block styles={{ root: { marginBottom: 20 } }}>Manage media files, like images or documents, for use across developer portal pages.</Text>
                    <Stack horizontal wrap verticalAlign="center" tokens={{ childrenGap: 12 }} styles={{ root: { marginBottom: 20 } }}>
                        <Stack.Item>
                            <SearchBox
                                ariaLabel="Search media"
                                placeholder="Search media..."
                                onChange={(event, searchValue) => this.searchMedia(searchValue)}
                                styles={{ root: { width: 220 } }}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <DefaultButton
                                iconProps={uploadIcon}
                                text="Upload files"
                                onClick={() => this.uploadMedia()}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <DefaultButton
                                iconProps={linkIcon}
                                text="Link file"
                                onClick={() => this.linkMedia()}
                            />
                        </Stack.Item>
                        {this.state.selectedFiles.length > 0 && 
                            <Stack.Item>
                                <DefaultButton
                                    iconProps={deleteIcon}
                                    text="Delete selected files"
                                    onClick={() => this.setState({ showDeleteConfirmation: true })}
                                />
                            </Stack.Item>
                        }
                    </Stack>
                    {this.state.isLoading && <Spinner styles={{ root: { paddingBottom: 20 } }} />}
                    <Stack horizontal tokens={{ childrenGap: 20 }} wrap>
                        {this.state.media.length === 0 && !this.state.isLoading
                            ? <Text block>It seems that you don't have media items yet.</Text>
                            : this.state.media.map(mediaItem =>
                                this.renderMediaItem(mediaItem)
                        )}
                    </Stack>
                </div>
            </Modal>
        </>
    }
}