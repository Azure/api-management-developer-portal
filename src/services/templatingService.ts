import * as Liquid from "liquidjs";

export class TemplatingService {
    public static async render(template: string, model: Object): Promise<string> {
        const engine = new Liquid.default();
        const result = await engine.parseAndRender(template, model, null);

        return result;
    }
}