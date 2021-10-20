import * as ko from "knockout";
import { Octokit } from "octokit";
import { GithubType } from "../constants";
import { MapiError } from "../errors/mapiError";
import { GithubFile } from "../models/githubFile";

/**
 * Service to get data from Github repository for documentation
 */
export class GithubService {
    private octokit: Octokit;
    private repoStructure: Array<GithubFile> = new Array<GithubFile>();
    private github = {
        owner: 'phfrc',
        repo: 'documentation-test',
        baseUrl: 'https://api.github.com'
    };

    constructor() {
        this.octokit = new Octokit({
            baseUrl: this.github.baseUrl
        });
    }

    public async getRepositoryStructure(): Promise<Array<GithubFile>> {
       const repositoryLoop = async (data: Array<GithubFile>) => {
            for (const datum of data) {
                // File: Add to repository structure
                if (datum['type'] === GithubType.file) {
                    this.repoStructure.push(new GithubFile({
                        fileName: datum['name'],
                        path: datum['path'],
                        url: datum['url']
                    }));
                } else if (datum['type'] === GithubType.directory) {    // Folder: Request content of folder and store in structure
                    await this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}/", {
                        owner: this.github.owner,
                        repo: this.github.repo,
                        path: datum['path']
                    }).then(async response => {
                        await repositoryLoop(response.data);
                    }).catch(error => {
                        throw new MapiError(error.status, '[Documentation Service] Getting (sub) folder structure failed: ' + error.message);
                    });
                }
            }
        }

        await this.octokit.request("GET /repos/{owner}/{repo}/contents", {
            owner: this.github.owner,
            repo: this.github.repo
        }).then(async response => {
            await repositoryLoop(response.data);
        }).catch(error => {
            throw new MapiError(error.status, '[Documentation Service] getRepositoryStructure failed: ' + error.message);
        });

        return this.repoStructure;
    }

    // Request: Get markdown content (base64)
    public async getMarkdown(path: string): Promise<void> {
        await this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}?ref=main", {
            owner: this.github.owner,
            repo: this.github.repo,
            path: path
        }).then(async response => {
            await this.renderMarkdown(atob(response.data['content']));
        }).catch(error => {
            throw new MapiError(error.status, '[Documentation Service] getMarkdown failed: ' + error.message);
        });
    }

    // Request: Render markdown from content (base64)
    public async renderMarkdown(markdown: string): Promise<string> {
        try {
            const response = await this.octokit.rest.markdown.render({
                text: markdown
            });

            if (response.status == 200) {
                return response.data;
            }
        } catch (error) {
            throw new MapiError(error.status, '[Documentation Service] renderMarkdown failed: ' + error.message);
        }
    }
}