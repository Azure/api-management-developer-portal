import { IApiClient } from "../clients";
import * as fs from "fs/promises";
import { ApimObjectStorageDecorator } from "./apimObjectStorageDecorator";
import { UpdateDeprecatedStorageUriVisitor } from "./contractVisitors/updateDeprecatedStorageUriVisitor";
import { StaticObjectStorage } from "./staticObjectStorage";
import { MediaContract, MediaService } from "@paperbits/common/media";
import { ConsoleLogger } from "@paperbits/common/logging";
import * as path from "path";
import { expect } from "chai";
import { MapiObjectStorage } from "./mapiObjectStorage";

describe("ApimObjectStorageDecorator", () => {
    const runs = [
        { permalink: "/content/hero-gradient.jpg", name: "09879768-b2c8-afbd-a945-934c046b3c2d" },
        { permalink: "/content/contoso-black.png", name: "4cac439d-5a3d-4b03-38bb-197d32256ee0" },
        { permalink: "/content/logo-contoso-small.png", name: "70add409-0933-e01e-acef-99999a71167e" },
        { permalink: "/content/featured-2.jpg", name: "a2514081-47cb-95b1-ef0b-aef128c7a7ed" },
        { permalink: "/content/featured-1.jpg", name: "c5d2da83-b255-245c-144b-cd3c242e9791" },
        { permalink: "/content/featured-3.jpg", name: "ed8e43d0-5f8e-af38-5536-8f0274656ce4" }
    ];

    describe("StaticObjectStorage decorator", () => {
        let storageDecorator: ApimObjectStorageDecorator;
        let mediaService: MediaService;

        beforeEach(async () => {
            const dataObject = await readDataObject("snapshot-m.json");
            const internalStorage = new StaticObjectStorage(dataObject);
            storageDecorator = new ApimObjectStorageDecorator(
                internalStorage,
                [
                    new UpdateDeprecatedStorageUriVisitor()
                ]);
            mediaService = new MediaService(storageDecorator, null, new ConsoleLogger());
        });

        runs.forEach((file) => {
            it(`Get media by permalink ${file.permalink} data from storage: download url is replaced`, async () => {
                const media = await mediaService.getMediaByPermalink(file.permalink);
                expect(media).to.not.be.undefined;
                expect(media.downloadUrl).to.be.equal(`https://apimdeveloperportal.z22.web.core.windows.net/${file.name}${path.extname(file.permalink)}`);
            });

            it(`Get media by key ${file.permalink} data from storage: download url is replaced`, async () => {
                const media = await mediaService.getMediaByKey(`uploads/${file.name}`);
                expect(media).to.not.be.undefined;
                expect(media.downloadUrl).to.be.equal(`https://apimdeveloperportal.z22.web.core.windows.net/${file.name}${path.extname(file.permalink)}`);
            });
        });

        it("Get object not failing for empty object", async () => {
            const media = await storageDecorator.getObject(`uploads/unknown`);
            expect(media).to.be.undefined;
        });

        it("Search objects not failing for empty object", async () => {
            const media = await storageDecorator.searchObjects(`uploads/unknown`);
            expect(media.value).to.be.empty;
        });
    });

    describe("MapiObjectStorage decorator", () => {
        let storageDecorator: ApimObjectStorageDecorator;
        let internalStorage: MapiObjectStorage;
        let mediaService: MediaService;
        let staticMapiClient: any;

        beforeEach(async () => {
            const dataObject = await readDataObject("default-m.json");
            const updates = new Map<string, object>();
            staticMapiClient = {
                head: async (_: string) => { return "" },
                get: async (url: string, _: string) => {
                    return dataObject[`/${url}`];
                },
                put: async (url: string, __: string, body: any) => {
                    updates[`/${url}`] = body.properties;
                },
                getPortalHeader: async (_: string) => { return "" },
                getUpdates: () => updates
            }
            internalStorage = new MapiObjectStorage(<any>staticMapiClient as IApiClient);
            storageDecorator = new ApimObjectStorageDecorator(
                internalStorage,
                [
                    new UpdateDeprecatedStorageUriVisitor()
                ]);
            mediaService = new MediaService(storageDecorator, null, new ConsoleLogger());
        });

        runs.forEach((file) => {
            it(`Get media by key ${file.permalink} data from storage: download url is replaced`, async () => {
                const media = await mediaService.getMediaByKey(`uploads/${file.name}`);
                expect(media).to.not.be.undefined;
                expect(media.downloadUrl).to.be.equal(`https://apimdeveloperportal.z22.web.core.windows.net/${file.name}${path.extname(file.permalink)}`);
            });

            it(`Update media replace it uri`, async () => {
                const existingObject = await internalStorage.getObject<MediaContract>(`uploads/${file.name}`);
                const cloneObject = JSON.parse(JSON.stringify(existingObject)) as MediaContract;
                cloneObject.permalink = cloneObject.permalink.replace(/[png]|[jpg]/, "txt");

                const originalUrl = cloneObject.downloadUrl;
                expect(originalUrl).to.be.a("string").satisfy(m => m.startsWith(`https://apimdeveloperportal.blob.core.windows.net/`));

                await storageDecorator.updateObject(`uploads/${file.name}`, cloneObject);

                const updatedObjects = await staticMapiClient.getUpdates();
                const updatedObject = updatedObjects[`/contentTypes/blob/contentItems/${file.name}`] as MediaContract;
                expect(updatedObject).to.not.be.undefined;
                expect(updatedObject.permalink).to.be.equal(cloneObject.permalink);
                expect(updatedObject.downloadUrl).to.be.equal(`https://apimdeveloperportal.z22.web.core.windows.net/${file.name}${path.extname(file.permalink)}`);
            })
        });

        it("Get object not failing for empty object", async () => {
            const media = await storageDecorator.getObject(`uploads/unknown`);
            expect(media).to.be.undefined;
        });
    });

    async function readDataObject(fileName: string): Promise<object> {
        let data = await fs.readFile(path.resolve(__dirname, `./../../templates/${fileName}`,), "utf8");
        data = data.replace(/https:\/\/apimdeveloperportal\.z22\.web\.core\.windows\.net\/([^\.]+)\.?([\w]{3,4})?/g, "https://apimdeveloperportal.blob.core.windows.net/content/$1");
        return JSON.parse(data);
    }
});
