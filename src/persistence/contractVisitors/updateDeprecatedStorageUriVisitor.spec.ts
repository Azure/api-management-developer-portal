import { UpdateDeprecatedStorageUriVisitor } from "./updateDeprecatedStorageUriVisitor";
import { expect } from "chai";

describe("UpdateDeprecatedStorageUriVisitor", () => {
    it("Should not fail if downloadUrl is not defined", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        const contract = <any>{ downloadUrl: undefined };
        visitor.visit(contract);
        expect(contract.downloadUrl).to.be.undefined;
    });

    it("Should not fail if contract is null", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        visitor.visit(null);
    });

    it("Should update deprecated storage uri", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        const contract = <any>{ downloadUrl: "https://apimdeveloperportal.blob.core.windows.net/content/09879768-b2c8-afbd-a945-934c046b3c2d" };
        visitor.visit(contract);
        expect(contract.downloadUrl).to.equal("https://apimdeveloperportal.z22.web.core.windows.net/09879768-b2c8-afbd-a945-934c046b3c2d.jpg");
    });

    it("Should not update deprecated storage uri", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        const contract = <any>{ downloadUrl: "https://apimdeveloperportal2.blob.core.windows.net/content/09879768-b2c8-afbd-a945-934c046b3c2d" };
        visitor.visit(contract);
        expect(contract.downloadUrl).to.equal("https://apimdeveloperportal2.blob.core.windows.net/content/09879768-b2c8-afbd-a945-934c046b3c2d");
    });

    it("Should resolve extension based on original extension first", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        const contract = <any>{ downloadUrl: "https://apimdeveloperportal.blob.core.windows.net/content/09879768-b2c8-afbd-a945-934c046b3c2d.mp3", permalink: "/content/hero-gradient.mp4" };
        visitor.visit(contract);
        expect(contract.downloadUrl).to.equal("https://apimdeveloperportal.z22.web.core.windows.net/09879768-b2c8-afbd-a945-934c046b3c2d.mp3");
    });

    it("Should resolve extension based on map second", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        const contract = <any>{ downloadUrl: "https://apimdeveloperportal.blob.core.windows.net/content/4cac439d-5a3d-4b03-38bb-197d32256ee0", permalink: "/content/hero-gradient.mp4" };
        visitor.visit(contract);
        expect(contract.downloadUrl).to.equal("https://apimdeveloperportal.z22.web.core.windows.net/4cac439d-5a3d-4b03-38bb-197d32256ee0.png");
    });

    it("Should resolve extension based on permalink third", () => {
        const visitor = new UpdateDeprecatedStorageUriVisitor();
        const contract = <any>{ downloadUrl: "https://apimdeveloperportal.blob.core.windows.net/content/unknown", permalink: "/content/hero-gradient.mp4" };
        visitor.visit(contract);
        expect(contract.downloadUrl).to.equal("https://apimdeveloperportal.z22.web.core.windows.net/unknown.mp4");
    });
});