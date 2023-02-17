import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { Server } from "http";
import { Products } from "../../mocks/collection/products";
import { Product } from "../../mocks/collection/product";
import { ProductseWidget } from "../maps/products";

describe("Products page", async () => {
    let config;
    let browser: puppeteer.Browser;
    let server: Server;
    
    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        browser.close();
        Utils.closeServer(server);
    });

    it("User can see producst on the page", async () => {
        var products = new Products();
        products.addProduct(Product.getStartedProduct());
        products.addProduct(Product.getUnlimitedProduct());

        server = await Utils.createMockServer([products.getProductListResponse()]);

        const page = await browser.newPage();
        await page.goto(config.urls.products);

        const productWidget = new ProductseWidget(page);
        await productWidget.products();

        expect(await page.evaluate(() =>
            document.querySelector("product-list-runtime div.table div.table-body div.table-row")?.parentElement?.childElementCount
        )).to.equal(products.productList.length);
    });
});