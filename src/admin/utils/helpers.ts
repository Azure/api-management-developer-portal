import * as MediaUtils from "@paperbits/common/media/mediaUtils";
import { MediaContract } from "@paperbits/common/media";
import { Operator, Query } from "@paperbits/common/persistence";

export const getThumbnailUrl = (mediaItem: MediaContract): string => {
    if (mediaItem?.mimeType?.startsWith("video")) {
        let thumbnailUrl: string = "";
        MediaUtils.getVideoThumbnailAsDataUrlFromUrl(mediaItem.downloadUrl).then(result => thumbnailUrl = result);

        return thumbnailUrl;
    }

    if (mediaItem?.mimeType?.startsWith("image")) {
        let thumbnailUrl = mediaItem.downloadUrl;

        if (mediaItem.variants) {
            thumbnailUrl = MediaUtils.getThumbnailUrl(mediaItem);
        }

        return thumbnailUrl;
    }

    return null;
}

// any is used as type because this helper function works for all kind of search values
export const getAllValues = async (page: any, values: any) => {
    if (page.takeNext === undefined || page.takeNext === null) return values;

    const nextPage = await page.takeNext();

    if (nextPage?.value.length > 0) {
        values = [...values, ...nextPage.value];

        return await getAllValues(nextPage, values);
    }
    
    return values;
}

export const createSearchQuery = (searchPattern: string, fieldName: string = 'title') => {
    const patternProcessed = searchPattern.replaceAll("#", "%23"); // TODO: Remove this when the issue with # in search is fixed on the Paperbits side
    const query = Query.from().orderBy(fieldName);
    if (patternProcessed) {
        query.where(fieldName, Operator.contains, patternProcessed);
    }

    return query;
}