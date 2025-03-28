import { MediaContract } from "@paperbits/common/media";
import { IObjectContractVisitor } from "./objectContractVisitor";
import * as path from "path";

export class UpdateDeprecatedStorageUriVisitor implements IObjectContractVisitor {
    private readonly fileExtensionMap = new Map<string, string>([
        ["09879768-b2c8-afbd-a945-934c046b3c2d", ".jpg"],
        ["3e3d574f-0238-288b-0eb4-a51b3680ef4b", ".png"],
        ["49d0127f-fb90-78ec-7f70-d5474e9eddb9", ".png"],
        ["4cac439d-5a3d-4b03-38bb-197d32256ee0", ".png"],
        ["70add409-0933-e01e-acef-99999a71167e", ".png"],
        ["a2514081-47cb-95b1-ef0b-aef128c7a7ed", ".jpg"],
        ["c5d2da83-b255-245c-144b-cd3c242e9791", ".jpg"],
        ["ed8e43d0-5f8e-af38-5536-8f0274656ce4", ".jpg"]
    ]);

    public visit(contract: MediaContract): void {
        if (!contract?.downloadUrl) {
            return;
        }
        const match = contract.downloadUrl.match(/https:\/\/apimdeveloperportal\.blob\.core\.windows\.net\/content\/([^\.]+)(\.[\w]{3,4})?/);
        if (match) {
            const extension = match[2] ?? this.fileExtensionMap.get(match[1]) ?? `.${contract.permalink?.split('.').pop()}`;
            contract.downloadUrl = `https://apimdeveloperportal.z22.web.core.windows.net/${match[1]}${extension}`;
        }
    }
}