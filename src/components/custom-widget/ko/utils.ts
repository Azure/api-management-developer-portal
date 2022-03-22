import { CustomWidgetModel } from "../customWidgetModel";

const blobContainer = "scaffoldtest";

export const customWidgetUriKey = key => `MS_APIM_CW_devsrc_${key}`;

export function loadDevSrc(environment: string, uri: string, filePath?: string): string | null {
  if (environment !== "development") return null;

  const developmentSrc = window.sessionStorage.getItem(customWidgetUriKey(uri));
  return developmentSrc ? developmentSrc + filePath : developmentSrc;
}

export function buildBlobStorageSrc({uri = ""}: Partial<CustomWidgetModel>, filePath: string = ""): string {
  return `https://${blobContainer}.blob.core.windows.net/${uri}/${filePath}`;
}

export function buildRemoteFilesSrc(model: Partial<CustomWidgetModel>, filePath: string = "", environment: string = ""): string {
  const developmentSrc = loadDevSrc(environment, model.uri, filePath);

  const values = {
    data: JSON.parse(model.customInputValue).data,
    origin: window.location.origin,
  };
  let searchParams = `?editorValues=${encodeURIComponent(JSON.stringify(values))}`;
  /** invalidate cache every 1 ms on dev */
  if (environment === "development") searchParams += `&v=${(new Date()).getTime()}`;

  return (developmentSrc ?? buildBlobStorageSrc(model, filePath)) + searchParams;
}
