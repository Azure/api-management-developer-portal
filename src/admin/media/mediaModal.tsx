import * as React from 'react';
import { saveAs } from 'file-saver';
import * as MediaUtils from '@paperbits/common/media/mediaUtils';
import { Resolve } from '@paperbits/react/decorators';
import { IMediaService } from '@paperbits/common/media';
import { MediaContract } from '@paperbits/common/media/mediaContract';
import { Query, Operator } from '@paperbits/common/persistence';
import { EventManager } from '@paperbits/common/events';
import { Checkbox, CommandBarButton, DefaultButton, IconButton, IIconProps, Image, ImageFit, IOverflowSetItemProps, Link, Modal, OverflowSet, PrimaryButton, SearchBox, Stack, Text } from '@fluentui/react';
import { type } from 'os';
import { MediaDetailsModal } from './mediaDetailsModal';

interface MediaModalState {
    media: MediaContract[],
    selectedFiles: MediaContract[],
    showMediaDetailsModal: boolean,
    selectedMediaFile: MediaContract
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

    constructor(props: MediaModalProps) {
        super(props);

        this.state = {
            media: [],
            selectedFiles: [],
            showMediaDetailsModal: false,
            selectedMediaFile: null
        }
    }

    componentDidMount(): void {
        this.searchMedia();
    }

    searchMedia = async (searchPattern: string = ''): Promise<void> => {
        const query = Query.from().orderBy('fileName');
        if (searchPattern) {
            query.where('fileName', Operator.contains, searchPattern);
        }

        const mediaSearchResult = await this.mediaService.search(query);
        this.setState({ media: mediaSearchResult.value });

        console.log(mediaSearchResult.value);
        console.log(this.state.selectedFiles);

        return;
    }

    saveChanges = () => {

    }

    selectMedia = (file: MediaContract, checked: boolean): void => {
        if (checked) {
            this.setState({ selectedFiles: [...this.state.selectedFiles, file] });
        } else {
            this.setState({ selectedFiles: this.state.selectedFiles.filter(media => media.key !== file.key) });
        }
    }

    deleteSelectedFiles = (): void => {
        this.state.selectedFiles.forEach(async file => await this.mediaService.deleteMedia(file));
        this.setState({ selectedFiles: [] });

        //this.eventManager.dispatchEvent('onSaveChanges');
        this.searchMedia();
    }

    deleteFile = async (file: MediaContract) => {
        await this.mediaService.deleteMedia(file);
        //this.eventManager.dispatchEvent('onSaveChanges');
        this.searchMedia();
    }

    onRenderItem = (item: IOverflowSetItemProps): JSX.Element => (
        <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
            {item.name}
        </Link>
    );
      
    onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
        // const buttonStyles: Partial<IButtonStyles> = {
        //   root: {
        //     minWidth: 0,
        //     padding: '0 4px',
        //     alignSelf: 'stretch',
        //     height: 'auto',
        //   },
        // };
        return (
          <IconButton
            title="More options"
            //styles={buttonStyles}
            menuIconProps={{ iconName: 'More' }}
            menuProps={{ items: overflowItems! }}
          />
        );
    };

    getThumbnailUrl = (mediaItem: MediaContract): string => {
        if (mediaItem.mimeType?.startsWith('video')) {
            let thumbnailUrl: string = '';
            MediaUtils.getVideoThumbnailAsDataUrlFromUrl(mediaItem.downloadUrl).then(result => thumbnailUrl = result);

            return thumbnailUrl;
        }

        if (mediaItem.mimeType?.startsWith('image')) {
            let thumbnailUrl = mediaItem.downloadUrl;

            if (mediaItem.variants) {
                thumbnailUrl = MediaUtils.getThumbnailUrl(mediaItem);
            }

            return thumbnailUrl;
        }

        return null;
    }

    openEditModal = (mediaItem: MediaContract) => {
        this.setState({ selectedMediaFile: mediaItem, showMediaDetailsModal: true })
    }

    renderMediaItem = (mediaItem: MediaContract): JSX.Element => {
        const thumbnailUrl: string = this.getThumbnailUrl(mediaItem);

        return (
            <div className="media-box">
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Checkbox
                        ariaLabel="Select image"
                        onChange={(event, checked) => this.selectMedia(mediaItem, checked)}
                    />
                    <IconButton iconProps={editIcon} title="Edit image" onClick={() => this.openEditModal(mediaItem)} />
                </Stack>
                <Image
                    src={thumbnailUrl}
                    imageFit={ImageFit.center}
                    styles={{ root: { flexGrow: 1, marginTop: 10, marginBottom: 20 } }}
                />
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text>{mediaItem.fileName}</Text>
                    <OverflowSet
                        aria-label="Image actions"
                        overflowItems={[
                            {
                                key: 'edit',
                                name: 'Edit',
                                onClick: () => this.openEditModal(mediaItem)
                            },
                            {
                                key: 'download',
                                name: 'Download',
                                onClick: () => saveAs(mediaItem.downloadUrl, mediaItem.fileName, { type: mediaItem.mimeType })
                            },
                            {
                                key: 'rename',
                                name: 'Rename'
                            },
                            {
                                key: 'delete',
                                name: 'Delete',
                                onClick: () => this.deleteFile(mediaItem)
                            }
                        ]}
                        onRenderOverflowButton={this.onRenderOverflowButton}
                        onRenderItem={this.onRenderItem}
                    />
                </Stack>
            </div>
        );
    }


    render(): JSX.Element {
        return <>
            {this.state.showMediaDetailsModal &&
                <MediaDetailsModal
                    mediaItem={this.state.selectedMediaFile}
                    onDismiss={this.props.onDismiss}
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal media-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text className="admin-modal-header-text">Media</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        {/* TODO: Add disable */}
                        <PrimaryButton text="Save" onClick={() => this.saveChanges()} /> 
                        <DefaultButton text="Discard" onClick={this.props.onDismiss} />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    <Stack horizontal wrap verticalAlign="center" tokens={{ childrenGap: 12 }} styles={{ root: { marginBottom: 20 } }}>
                        <Stack.Item>
                            <SearchBox
                                ariaLabel="Search media"
                                placeholder="Search media..."
                                onChange={(event, searchValue) => this.searchMedia(searchValue)}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <DefaultButton
                                iconProps={uploadIcon}
                                text="Upload files"
                                //onClick={() => this.setState({ showLayoutModal: true, selectedLayout: null })}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <DefaultButton
                                iconProps={linkIcon}
                                text="Link files"
                            />
                        </Stack.Item>
                        {this.state.selectedFiles.length > 0 && 
                            <Stack.Item>
                                <DefaultButton
                                    iconProps={deleteIcon}
                                    text="Delete selected files"
                                    onClick={() => this.deleteSelectedFiles()}
                                />
                            </Stack.Item>
                        }
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 20 }} wrap>
                        {this.state.media.map(mediaItem =>
                            this.renderMediaItem(mediaItem)
                        )}
                    </Stack>
                </div>
            </Modal>
        </>
    }
}