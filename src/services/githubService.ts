import { Octokit } from "octokit";
import { GithubRepository } from "../constants";
import { MapiError } from "../errors/mapiError";

/**
 * Service to get data from Github repository for documentation
 */
export class GithubService {
    private octokit: Octokit;

    constructor() {
        this.octokit = new Octokit();
    }

    public async getRepositoryTree() {
        try {
            const commitResponse = await this.octokit.request('GET /repos/{owner}/{repo}/branches/main', {
                owner: GithubRepository.owner,
                repo: GithubRepository.repo
            });

            if (commitResponse.status === 200) {
                console.log('COMMIT sha: ', commitResponse.data['commit']['sha']);
                return await this.octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
                    owner: GithubRepository.owner,
                    repo: GithubRepository.repo,
                    tree_sha: commitResponse.data['commit']['sha'],
                    recursive: 'true'
                });
            }
        } catch (error) {
            throw new Error('[Documentation service] Getting data from Github API failed: ' + error.message);
        }
    }

    // Request: Get markdown content (base64)
    public async getMarkdown(path: string): Promise<void> {
        await this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}?ref=main", {
            owner: GithubRepository.owner,
            repo: GithubRepository.repo,

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