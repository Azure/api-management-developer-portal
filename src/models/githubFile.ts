/**
 * Github File model.
 */
export class GithubFile {
    public fileName: string;
    public path: string;
    public url: string;

    public constructor(init?:Partial<GithubFile>) {
        Object.assign(this, init);
    }
}