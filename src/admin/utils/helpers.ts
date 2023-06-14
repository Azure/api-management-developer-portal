import * as MediaUtils from '@paperbits/common/media/mediaUtils';
import { MediaContract } from '@paperbits/common/media';

export const getThumbnailUrl = (mediaItem: MediaContract): string => {
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