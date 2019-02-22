import { MapiClient } from "./../../src/services/mapiClient";
import { MapiObjectStorage } from "../../src/persistence/mapiObjectStorage";
import { assert, expect } from "chai";

describe("MAPI Object Storage", async () => {
    it("Correctly translates resources", async () => {
        const mapiClient = new MapiClient(null, null, null, null);
        const mapiObjectStorage = new MapiObjectStorage(mapiClient);

        const pageResource = mapiObjectStorage.paperbitsKeyToArmResource("pages/somepage");
        expect(pageResource).equals("contentTypes/page/contentItems/somepage");

        const blobResource = mapiObjectStorage.paperbitsKeyToArmResource("uploads/somepicture");
        expect(blobResource).equals("contentTypes/blob/contentItems/somepicture");

        const urlResource = mapiObjectStorage.paperbitsKeyToArmResource("urls/someurl");
        expect(urlResource).equals("contentTypes/url/contentItems/someurl");

        const navigationResource = mapiObjectStorage.paperbitsKeyToArmResource("navigationItems");
        expect(navigationResource).equals("contentTypes/document/contentItems/navigation");

        const settingsResource = mapiObjectStorage.paperbitsKeyToArmResource("settings");
        expect(settingsResource).equals("contentTypes/document/contentItems/configuration");
    });

    it("Test 2", async () => {
        console.log("Test 3");
    });

    it("Test 3", async () => {
        console.log("Test 4");
    });
});