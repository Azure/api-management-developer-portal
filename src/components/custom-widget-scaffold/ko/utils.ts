import { CustomWidgetModel } from "../customWidgetModel";

const blobContainer = "scaffoldtest";

export function buildBlobStorageSrc({uri = ""}: Partial<CustomWidgetModel>, filePath: string = ""): string {
  return `https://${blobContainer}.blob.core.windows.net/${uri}/${filePath}`;
}

export function buildRemoteFilesSrc(model: Partial<CustomWidgetModel>, filePath: string = ""): string {
  let developmentSrc;
  // TODO if in DEV mode only, ignore on prod - could cause a security vulnerability?
  if (true) {
    const key = `cw_${model.uri}_devsrc`;
    const searchParams = new URLSearchParams(window.location.search);
    developmentSrc = searchParams.get(key);
    if (developmentSrc) window.sessionStorage.setItem(key, developmentSrc);
    else developmentSrc = window.sessionStorage.getItem(key);

    if (developmentSrc) developmentSrc = developmentSrc + filePath;
  }

  const values = {
    data: JSON.parse(model.customInputValue).data,
    origin: window.location.origin,
  };
  const editorValuesStr = `?editorValues=${encodeURIComponent(JSON.stringify(values))}`;

  return (developmentSrc ?? buildBlobStorageSrc(model, filePath)) + editorValuesStr;
}
