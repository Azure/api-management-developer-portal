import { test, expect } from "../playwright-test";
import { SignInBasicWidget } from "../maps/signin-basic";
import { ProfileWidget } from "../maps/profile";
import { ProductseWidget } from "../maps/products";
import { User } from "../../mocks/collection/user";
import { Subscription } from "../../mocks/collection/subscription";
import { Templating } from "../../templating";
import { Product } from "../../mocks/collection/product";

test.describe("user-resources", async () => {
    test("user-can-subscribe-to-product-and-see-subscription-key", async function ({page, configuration, cleanUp, mockedData, productService, userService, testRunner})  {
        // data init
        var userInfo: User = User.getRandomUser("user1");
        var product1: Product = Product.getRandomProduct("product1");
        var subscription: Subscription = Subscription.getRandomSubscription("subscription1", userInfo, product1);

        //mocked data for local runtime
        mockedData.data = Templating.updateTemplate(JSON.stringify(mockedData.data), userInfo, product1, subscription);

        async function populateData(): Promise<any>{
            await userService.putUser("users/"+userInfo.publicId, userInfo.getRequestContract());
            cleanUp.push(async () => userService.deleteUser("users/"+userInfo.publicId, true));

            await productService.putProduct("products/"+product1.productId, product1.getContract());
            await productService.putProductGroup("products/"+product1.productId, "groups/developers");
            cleanUp.push(async () => productService.deleteProduct("products/"+product1.productId, true));
        }
        
        async function validate(){
            // widgets init
            const signInWidget = new SignInBasicWidget(page, configuration);
            const profileWidget = new ProfileWidget(page);
            const productsWidget = new ProductseWidget(page);

            //sign in
            await signInWidget.signInWithBasic(userInfo);
            expect(page.url()).toBe(configuration['urls']['home']);

            // subscribe to product
            await page.goto(configuration['urls']['products']+"/"+product1.productId);
            await productsWidget.subscribeToProduct(configuration['root'], product1.productId, subscription.displayName);
            await profileWidget.waitRuntimeInit();
            
            // check subscription primary key
            var subscriptionPrimaryKeyHidden = await profileWidget.getSubscriptioPrimarynKey(subscription.displayName);
            await profileWidget.togglePrimarySubscriptionKey(subscription.displayName);
            var subscriptionPrimaryKeyShown = await profileWidget.getSubscriptioPrimarynKey(subscription.displayName);
            expect(subscriptionPrimaryKeyHidden).not.toBe(subscriptionPrimaryKeyShown);

            // check subscription secondary key
            var subscriptionSecondaryKeyHidden = await profileWidget.getSubscriptioSecondarynKey(subscription.displayName);
            await profileWidget.toggleSecondarySubscriptionKey(subscription.displayName);
            var subscriptionSecondaryKeyShown = await profileWidget.getSubscriptioSecondarynKey(subscription.displayName);
            expect(subscriptionSecondaryKeyHidden).not.toBe(subscriptionSecondaryKeyShown);

            // check profile page screenshot with mocked data for profile page
            expect(await page.screenshot({ type: "jpeg", fullPage: true, mask: await profileWidget.getListOfLocatorsToHide(), maskColor: '#ffffff'})).toMatchSnapshot({name: 'user-resources.jpeg', maxDiffPixels: 20});
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });
});