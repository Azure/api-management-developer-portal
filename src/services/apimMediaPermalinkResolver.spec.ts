import { IMediaService, MediaContract } from "@paperbits/common/media";
import { expect } from "chai";
import { SinonStub, stub } from "sinon";
import { ApimMediaPermalinkResolver } from "./apimMediaPermalinkResolver";
import { HyperlinkModel } from "@paperbits/common/permalinks";

describe("ApimMediaPermalinkResolver", () => {
  let mediaService: IMediaService;
  let resolver: ApimMediaPermalinkResolver;

  beforeEach(() => {
    mediaService = <any>{
      getMediaByKey: async (_) => null,
      getMediaByPermalink: async (_) => null,
    };
    resolver = new ApimMediaPermalinkResolver(mediaService);
  });

  describe("canHandleTarget", () => {
    it("should return true for target keys starting with 'uploads/'", () => {
      const result = resolver.canHandleTarget("uploads/image.jpg");
      expect(result).to.be.true;
    });

    it("should return false for target keys not starting with 'uploads/'", () => {
      const result = resolver.canHandleTarget("images/image.jpg");
      expect(result).to.be.false;
    });
  });

  describe("getUrlByTargetKey", () => {
    it("should return null if media is not found", async () => {
      const mediaKey = "uploads/image.jpg";
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(null);

      const result = await resolver.getUrlByTargetKey(mediaKey);

      expect(result).to.be.null;
      expect(mediaServiceStub.calledOnceWith(mediaKey)).to.be.true;
    });

    it("should return the download URL of the biggest media variant if available", async () => {
      const mediaKey = "uploads/image.jpg";
      const media: MediaContract = <any>{
        variants: [
          { downloadUrl: "https://example.com/image.jpg", width: 1024 },
          { downloadUrl: "https://example.com/image_small.jpg", width: 512 },
        ],
      };
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(media);

      const result = await resolver.getUrlByTargetKey(mediaKey);

      expect(result).to.equal("https://example.com/image.jpg");
      expect(mediaServiceStub.calledOnceWith(mediaKey)).to.be.true;
    });

    it("should return the permalink if blob key is set", async () => {
      const mediaKey = "uploads/image.jpg";
      const media: MediaContract = <any>{
        blobKey: "test",
        permalink: "/content/image.jpg",
      };
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(media);

      const result = await resolver.getUrlByTargetKey(mediaKey);

      expect(result).to.equal("/content/image.jpg");
      expect(mediaServiceStub.calledOnceWith(mediaKey)).to.be.true;
    });

    it("should return download url if blob key is not set", async () => {
        const mediaKey = "uploads/image.jpg";
        const media: MediaContract = <any>{
          permalink: "/content/image.jpg",
          downloadUrl: "https://example.com/image.jpg"
        };
        const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(media);

        const result = await resolver.getUrlByTargetKey(mediaKey);

        expect(result).to.equal("https://example.com/image.jpg");
        expect(mediaServiceStub.calledOnceWith(mediaKey)).to.be.true;
      });

    it("should return the download URL if no media variants or permalink are available", async () => {
      const mediaKey = "uploads/image.jpg";
      const media: MediaContract = <any>{
        downloadUrl: "https://example.com/image.jpg",
      };
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(media);

      const result = await resolver.getUrlByTargetKey(mediaKey);

      expect(result).to.equal("https://example.com/image.jpg");
      expect(mediaServiceStub.calledOnceWith(mediaKey)).to.be.true;
    });
  });

  describe("getHyperlinkByTargetKey", () => {
    it("should return null if targetKey does not start with 'uploads/'", async () => {
      const targetKey = "images/image.jpg";
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(null);

      const result = await resolver.getHyperlinkByTargetKey(targetKey);

      expect(result).to.be.null;
      expect(mediaServiceStub.called).to.be.false;
    });

    it("should return null if media is not found", async () => {
      const targetKey = "uploads/image.jpg";
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(null);

      const result = await resolver.getHyperlinkByTargetKey(targetKey);

      expect(result).to.be.null;
      expect(mediaServiceStub.called).to.be.true;
    });

    it("should return a HyperlinkModel with the media details", async () => {
      const targetKey = "uploads/image.jpg";
      const media: MediaContract = <any>{
        key: targetKey,
        downloadUrl: "https://example.com/image.jpg",
        fileName: "image.jpg",
      };
      const mediaServiceStub = stub(mediaService, "getMediaByKey").resolves(media);

      const result = await resolver.getHyperlinkByTargetKey(targetKey);

      expect(result).to.be.instanceOf(HyperlinkModel);
      expect(result.targetKey).to.equal(targetKey);
      expect(result.href).to.equal("https://example.com/image.jpg");
      expect(result.title).to.equal("image.jpg");
      expect(mediaServiceStub.calledOnceWith(targetKey)).to.be.true;
    });
  });
});