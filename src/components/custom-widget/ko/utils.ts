import { CustomWidgetModel } from "../customWidgetModel";
import { TCustomWidgetConfig } from "scaffold/scaffold";

const blobContainer = "scaffoldtest";

export const OVERRIDE_CONFIG_SESSION_KEY_PREFIX = "MS_APIM_CW_devsrc_";

export const widgetArchiveName = (config: TCustomWidgetConfig) => `${config.name}-msapim-widget.zip`;

export function buildBlobStorageSrc(name: string): string {
  return `https://${blobContainer}.blob.core.windows.net/${name}/`;
}

export function buildWidgetSource(model: Partial<CustomWidgetModel>, filePath: string = "", environment: string = ""): {override: string | null, src: string} {
  const developmentSrc = environment === "development"
    ? window.sessionStorage.getItem(OVERRIDE_CONFIG_SESSION_KEY_PREFIX + model.name)
    : null;

  const values = {
    data: JSON.parse(model.customInputValue).data,
    origin: window.location.origin,
  };
  let searchParams = `?editorValues=${encodeURIComponent(JSON.stringify(values))}`;
  /** invalidate cache every 1 ms on dev */
  if (environment === "development") searchParams += `&v=${(new Date()).getTime()}`;

  return {
    override: developmentSrc,
    src: (developmentSrc ?? buildBlobStorageSrc(model.name)) + filePath + searchParams
  };
}
