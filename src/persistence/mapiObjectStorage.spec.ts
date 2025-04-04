import { expect } from "chai";
import { IApiClient } from "../clients";
import { MapiObjectStorage } from "./mapiObjectStorage";
import { ArmResource } from "../contracts/armResource";
import { AppError } from "../errors";

describe("MapiObjectStorage", () => {
    let storage: MapiObjectStorage;
    let mapiClient: Partial<IApiClient>;

    beforeEach(() => {
        mapiClient = {};
        storage = new MapiObjectStorage(mapiClient as IApiClient);
    });

    [
        ["pages/somePage", "contentTypes/page/contentItems/somePage"],
        ["layouts/someLayout", "contentTypes/layout/contentItems/someLayout"],
        ["uploads/somePicture", "contentTypes/blob/contentItems/somePicture"],
        ["blocks/someBlock", "contentTypes/block/contentItems/someBlock"],
        ["urls/someUrl", "contentTypes/url/contentItems/someUrl"],
        ["navigationItems", "contentTypes/document/contentItems/navigation"],
        ["settings", "contentTypes/document/contentItems/configuration"],
        ["styles", "contentTypes/document/contentItems/stylesheet"],
        ["files/someFile", "contentTypes/document/contentItems/someFile"],
        ["locales", "contentTypes/locales/contentItems/en-us"],
        ["popups/somePopup", "contentTypes/popup/contentItems/somePopup"],
        ["undefinedKey", "undefinedKey"],
    ].forEach(([paperbitsKey, armResource]) => {
        it(`paperbitsKeyToArmResource should translate paperbits key ["${paperbitsKey}", "${armResource}"]`, () => {
            const resource = storage.paperbitsKeyToArmResource(paperbitsKey);
            expect(resource).equals(armResource);
        });
    });

    it(`paperbitsKeyToArmResource should remove leading slash`, () => {
        const resource = storage.paperbitsKeyToArmResource("/undefinedKey");
        expect(resource).equals("undefinedKey");
    });

    [
        ["contentTypes/page/contentItems/somePage", "pages/somePage"],
        ["contentTypes/layout/contentItems/someLayout", "layouts/someLayout"],
        ["contentTypes/blob/contentItems/somepicture", "uploads/somepicture"],
        ["contentTypes/block/contentItems/someBlock", "blocks/someBlock"],
        ["contentTypes/url/contentItems/someurl", "urls/someurl"],
        ["contentTypes/navigation/contentItems/", "navigationItems"],
        ["contentTypes/configuration/contentItems/", "settings"],
        ["contentTypes/stylesheet/contentItems/", "styles"],
        ["contentTypes/document/contentItems/someDocument", "files/someDocument"],
        ["contentTypes/popup/contentItems/somePopup", "popups/somePopup"],
        ["undefinedKey", "undefinedKey"],
    ].forEach(([armResource, paperbitsKey]) => {
        it(`armResourceToPaperbitsKey should translate paperbits key ["${armResource}", "${paperbitsKey}"]`, () => {
            const key = storage.armResourceToPaperbitsKey(armResource);
            expect(key).equals(paperbitsKey);
        });
    });

    it("armResourceToPaperbitsKey should throw exception for unknown type", () => {
        expect(() => storage.armResourceToPaperbitsKey("contentTypes/unknownType/contentItems/"))
            .throws(AppError, `Unknown content type: "unknownType"`);
    });

    it("convertArmContractToPaperbitsContract should convert page contract", () => {
        // assume
        const pageResource: ArmResource = {
            id: "contentTypes/page/contentItems/somePage",
            type: "type",
            name: "somePage",
            properties: {
                "en_us": {
                    title: "title",
                    description: "description",
                    permalink: "/somePage",
                    documentId: "contentTypes/document/contentItems/id",
                },
                access: {
                    type: "product",
                    allow: ["allowedProduct"],
                },
            },
        };

        // act
        const paperbitsContract = storage.convertArmContractToPaperbitsContract(pageResource, true);

        // assert
        const expectedPageContract = {
            key: "pages/somePage",
            locales: {
                "en-us": {
                    title: "title",
                    description: "description",
                    permalink: "/somePage",
                    contentKey: "files/id",
                },
            },
            access: {
                type: "product",
                allow: ["allowedProduct"],
            },
        };
        expect(paperbitsContract).to.deep.equal(expectedPageContract);
    });

    it("convertPaperbitsContractToArmContract should convert page contract", () => {
        // assume
        const pageContract: any = {
            key: "pages/somePage",
            "en_us": {
                title: "title",
                description: "description",
                permalink: "/somePage",
                contentKey: "files/id",
            },
            access: {
                type: "product",
                allow: ["allowedProduct"],
            },
        };

        // act
        const pageResource = storage.convertPaperbitsContractToArmContract(pageContract);

        // assert
        const expectedPageResourceObject: any = {
            id: "contentTypes/page/contentItems/somePage",
            "en_us": {
                title: "title",
                description: "description",
                permalink: "/somePage",
                documentId: "contentTypes/document/contentItems/id",
            },
            access: {
                type: "product",
                allow: ["allowedProduct"],
            },
        };
        expect(pageResource).to.deep.equal(expectedPageResourceObject);
    });


});
