import * as React from 'react';
import * as Utils from '@paperbits/common/utils';
import * as MediaUtils from '@paperbits/common/media/mediaUtils';
import { Resolve } from '@paperbits/react/decorators';
import { EventManager } from '@paperbits/common/events';
import { ViewManager } from '@paperbits/common/ui';
import { IMediaService } from '@paperbits/common/media';
import { MediaContract } from '@paperbits/common/media/mediaContract';
import { DefaultButton, IIconProps, Image, ImageFit, IOverflowSetItemProps, Link, Modal, SearchBox, Stack, Text } from '@fluentui/react';
import { createSearchQuery, getAllValues } from '../utils/helpers';
import { NonImageDetailsModal } from './nonImageDetailsModal';
import { MimeTypes } from '@paperbits/common';

interface MediaSelectionItemModalState {
    media: MediaContract[],
    selectedMediaFile: MediaContract,
    showNonImageDetailsModal: boolean,
}

interface MediaSelectionItemModalProps {
    selectMedia: (mediaItem: MediaContract) => void,
    onDismiss: () => void
}

const uploadIcon: IIconProps = { iconName: 'Upload' };
const linkIcon: IIconProps = { iconName: 'Link' };

export class MediaSelectionItemModal extends React.Component<MediaSelectionItemModalProps, MediaSelectionItemModalState> {
    @Resolve('mediaService')
    public mediaService: IMediaService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: MediaSelectionItemModalProps) {
        super(props);

        this.state = {
            media: [],
            selectedMediaFile: null,
            showNonImageDetailsModal: false
        }
    }

    componentDidMount(): void {
        this.searchMedia();
    }

    searchMedia = async (searchPattern: string = ''): Promise<void> => {
        const query = createSearchQuery(searchPattern, 'fileName');
        const mediaSearchResult = await this.mediaService.search(query);
        const allMedia = await getAllValues(mediaSearchResult, mediaSearchResult.value);
        this.setState({ media: allMedia });

        return;
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
        this.setState({ selectedMediaFile: newMediaFile, showNonImageDetailsModal: true });
    }

    onRenderItem = (item: IOverflowSetItemProps): JSX.Element => (
        <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
            {item.name}
        </Link>
    );

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

    renderMediaItem = (mediaItem: MediaContract): JSX.Element => {
        const thumbnailUrl: string = this.getThumbnailUrl(mediaItem);

        return (
            <div className="media-box media-selection-block" onClick={() => this.props.selectMedia(mediaItem)} key={mediaItem.key}>
                <Image
                    src={thumbnailUrl ?? '/assets/images/no-preview.png'}
                    imageFit={ImageFit.centerCover}
                    styles={{ root: { flexGrow: 1, marginTop: 10, marginBottom: 20 } }}
                />
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text>{mediaItem.fileName}</Text>
                </Stack>
            </div>
        );
    }

    render(): JSX.Element {
        return <>
            {this.state.showNonImageDetailsModal &&
                <NonImageDetailsModal
                    mediaItem={this.state.selectedMediaFile}
                    onDismiss={() => {
                        this.setState({ showNonImageDetailsModal: false });
                        this.searchMedia();
                    }}
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
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 20 }} wrap>
                        {this.state.media.length === 0
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