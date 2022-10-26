import { Page } from "puppeteer";

export class Profile {
    constructor(private readonly page: Page) { }

    public async profile(): Promise<void> {


        await new Promise(resolve => {
            setTimeout(resolve, 50000000) // just long wait
        })
    }
}