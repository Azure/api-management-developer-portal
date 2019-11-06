import { Liquid } from "liquidjs";

export class TemplatingService {
    public static async render(template: string, model: Object): Promise<string> {
        const engine = new Liquid();
        const result = await engine.parseAndRender(template, model, null);

        return result;
    }
}