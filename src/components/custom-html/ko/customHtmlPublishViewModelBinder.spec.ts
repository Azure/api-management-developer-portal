import { FontFace, StyleSheet } from "@paperbits/common/styles";
import { ApimDefaultStyleCompiler } from "../../../styles/apimDefaultStyleCompiler";
import { CustomHtmlPublishViewModelBinder } from "./customHtmlPublishViewModelBinder";
import { ConsoleLogger } from "@paperbits/common/logging/consoleLogger";
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from "sinon";
import { IBlobStorage } from "@paperbits/common/persistence";
import { expect } from "chai";
import { CustomHtmlModel } from "../customHtmlModel";

const htmlCode = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        /* Custom styles */
        body {
            text-align: left;
        }
    </style>
</head>
<body>
    <fieldset>
        <h1>Custom HTML code example</h1>
        <p>Replace this content with custom HTML code. It will be rendered in an iframe in the developer portal.</p>
        <button class="button button-default">
           Sample button
        </button>
        <button class="button button-primary">
           Sample button
        </button>
    </fieldset>
</body>
</html>`;

const fontStyle = "@font-face { src: url(data:font/truetype;charset=utf-8;base64,Q3VzdG9tIEZvbnQgZGF0YQ==); font-family: smujyfmcvp; font-style: normal; font-weight: 400;}";
const customFontData = "Custom Font data";



describe("CustomHtmlPublishViewModelBinder", () => {
    let binder: CustomHtmlPublishViewModelBinder;
    let storage: IBlobStorage;
    let styleCompiler: SinonStubbedInstance<ApimDefaultStyleCompiler>;
    let model: CustomHtmlModel;
    let globalStyleSheet: StyleSheet;
    const customFont = new FontFace();
    const googleFont = new FontFace();

    beforeEach(() => {
        customFont.fontFamily = "smujyfmcvp";
        customFont.source = "/fonts/5dc970b9-74d4-2caf-7ac0-31f1adfeeee1.ttf";
        customFont.fontStyle = "normal";
        customFont.fontWeight = 400;

        googleFont.fontFamily = "Roboto";
        googleFont.source = "https://fonts.gstatic.com/s/roboto/v18/KFOjCnqEu92Fr1Mu51TjARc9.ttf";
        googleFont.fontStyle = "italic";
        googleFont.fontWeight = 300;

        model = new CustomHtmlModel();
        model.inheritStyling = true;
        model.addCustomFonts = false;
        model.htmlCode = htmlCode;

        globalStyleSheet = new StyleSheet();
        globalStyleSheet.fontFaces.push(googleFont);
        globalStyleSheet.fontFaces.push(customFont);

        styleCompiler = createStubInstance(ApimDefaultStyleCompiler);
        styleCompiler.getStyleSheet.returns(Promise.resolve(globalStyleSheet));
        storage = {
            uploadBlob: async (blobKey: string, content: Uint8Array, contentType?: string) => { console.log("uploadBlob", blobKey); },
            deleteBlob: async (blobKey: string) => {console.log("deleteBlob", blobKey);},
            downloadBlob: async (blobKey: string) => Promise.resolve(null),
            getDownloadUrl: async (blobKey: string) => Promise.resolve("")
        };
        binder = new CustomHtmlPublishViewModelBinder(styleCompiler, storage, storage, new ConsoleLogger());
    });

    it("should bind the view model correctly with custom font", async () => {
        await testModelToState(true, true);
    });

    it("should bind the view model correctly with NO custom font", async () => {
        await testModelToState(false, true);
    });

    it("should bind the view model correctly with NO global styles", async () => {
        await testModelToState(false, false);
    });

    async function testModelToState(addCustomFonts: boolean, inheritStyling: boolean) {
        const state = {
            styles: null,
            htmlCode: null,
            src: null
        };
        const buffer = Buffer.from(customFontData, "utf8");
        const blobContent = new Uint8Array(buffer);
        const downloadBlobStub: SinonStub = stub(storage, "downloadBlob").resolves(blobContent);
        const uploadBlobStub: SinonStub = stub(storage, "uploadBlob").resolves();
        model.addCustomFonts = addCustomFonts;
        model.inheritStyling = inheritStyling;
        await binder.modelToState(model, state);
        expect(state.src).to.not.be.null;
        expect(state.src.startsWith("/content/html_widgets/")).to.be.true;
        expect(state.src.endsWith(".html")).to.be.true;

        expect(downloadBlobStub.calledOnceWith("/fonts/5dc970b9-74d4-2caf-7ac0-31f1adfeeee1.ttf")).to.be.equal(addCustomFonts && inheritStyling);
        expect(uploadBlobStub.calledOnce).to.be.true;
        const args = uploadBlobStub.lastCall.args;
        expect(args[0]).to.equal(state.src);
        const content: Uint8Array = args[1];
        expect(content).to.not.be.null;
        const htmlContent = Buffer.from(content).toString("utf8");
        expect(htmlContent.includes('<link href="/styles/theme.css" rel="stylesheet" type="text/css"><link href="/styles/styles.css" rel="stylesheet" type="text/css">')).to.be.equal(inheritStyling);
        expect(htmlContent.includes(fontStyle)).to.be.equal(addCustomFonts && inheritStyling);
        expect(htmlContent).not.contains(googleFont.fontFamily);
    }
});