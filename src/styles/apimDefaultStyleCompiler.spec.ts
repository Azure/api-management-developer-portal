import { StyleService } from "@paperbits/styles";
import { expect } from "chai";
import { describe, it } from "mocha";
import { ApimDefaultStyleCompiler } from "./apimDefaultStyleCompiler"

import { ConsoleLogger } from "@paperbits/common/logging";

describe("ManagedDefaultStyleCompiler", async () => {

    it("should not throw of an older contentType schema when calling getStyleModelAsync", async () => {
        const styleService = new StyleService(null, null, null, null, null, null);
        const managedDefaultStyleCompiler = new ApimDefaultStyleCompiler(styleService, null, new ConsoleLogger());
        const styleModel = await managedDefaultStyleCompiler.getStyleModelAsync({
            "size": { "xs": "utils/block/stretch" } //unsupported value
        });
        expect(styleModel).not.to.be.undefined;
        expect(styleModel.classNames).to.eq("");
    });
});

