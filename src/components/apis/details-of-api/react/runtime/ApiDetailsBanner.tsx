import * as React from "react";
import { Body1, Button, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, Title1 } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { Page } from "../../../../../models/page";
import { ArrowDownloadRegular } from "@fluentui/react-icons";
import { ApiService } from "../../../../../services/apiService";
import { KnownMimeTypes } from "../../../../../models/knownMimeTypes";

type ApiDetailsBannerProps = {
    api: Api,
    apiService: ApiService
}

export enum TDefinition {
    "wadl" = "wadl",
    "openapiyaml" = "openapiyaml",
}

export const ApiDetailsBanner = ({ api, apiService }: ApiDetailsBannerProps) => {
    const downloadApiDefinition = async (definitionType?: TDefinition) => {
        let exportObject = await apiService.exportApi(api.id, definitionType);
        let fileName = api.name;
        let fileType: string = KnownMimeTypes.Json;

        switch (definitionType) {
            case "wadl":
                fileType = KnownMimeTypes.Xml;
                fileName = `${fileName}.${definitionType}.xml`;
                break;
            case "openapiyaml":
                fileName = `${fileName}.yaml`;
                break;
            default:
                fileName = `${fileName}.json`;
                exportObject = JSON.stringify(exportObject, null, 4);
                break;
        }
        download(exportObject, fileName, fileType);
    }

    const download = (data: string, filename: string, type: string): void => {
        const file = new Blob([data], { type: type });
        const downloadLink = document.createElement("a");
        const url = URL.createObjectURL(file);

        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
    }

    return (
        <div className={"fui-api-details-banner"}>
            <Title1>{api.displayName}</Title1>
            <div className={"fui-api-details-banner-bottom-container"}>
                <Body1>{api.description}</Body1>
                <div>
                    <Menu>
                        <MenuTrigger>
                            <MenuButton appearance="primary" icon={<ArrowDownloadRegular />}>Download definition</MenuButton>
                        </MenuTrigger>

                        <MenuPopover>
                            <MenuList>
                                <MenuItem onClick={() => downloadApiDefinition(TDefinition.openapiyaml)}>Open API 3 (YAML)</MenuItem>
                                <MenuItem onClick={() => downloadApiDefinition()}>Open API 3 (JSON)</MenuItem>
                                <MenuItem onClick={() => downloadApiDefinition()}>Open API 2 (JSON)</MenuItem>
                                <MenuItem onClick={() => downloadApiDefinition(TDefinition.wadl)}>WADL</MenuItem>
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                </div>
            </div>
        </div>
    );
};