import { KnownMimeTypes } from "../../models/knownMimeTypes";

export function downloadAPIDefinition(fileName: string, exportedObject: any, definitionType: string) {
    let fileType: string = KnownMimeTypes.Json;

    switch (definitionType) {
        case "wsdl":
        case "wadl":
            fileType = KnownMimeTypes.Xml;
            fileName = `${fileName}.${definitionType}.xml`;
            break;
        case "openapi": // yaml 3.0
            fileName = `${fileName}.yaml`;
            break;
        default:
            fileName = `${fileName}.json`;
            exportedObject = JSON.stringify(exportedObject, null, 4);
            break;
    }
    download(exportedObject, fileName, fileType);
}

function download(data: string, filename: string, type: string): void {
    const file = new Blob([data], { type: type });
    const downloadLink = document.createElement("a");
    const url = URL.createObjectURL(file);

    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
    }, 0);
}