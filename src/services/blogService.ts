
import * as Utils from "@paperbits/common/utils";
import { BlogPostContract, IBlogService } from "@paperbits/common/blogs";
import { IBlockService } from "@paperbits/common/blocks";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";

const blogPostsPath = "contentTypes/blogPost/contentItems";
const documentsPath = "contentTypes/document/contentItems";
const templateBlockKey = "contentTypes/block/contentItems/new-page-template";

export class BlogService implements IBlogService {
    constructor(
        private readonly smapiClient: SmapiClient,
        private readonly blockService: IBlockService
    ) { }

    public async getBlogPostByPermalink(permalink: string): Promise<BlogPostContract> {
        const blogPostOfBlogPosts = await this.smapiClient.get<Page<BlogPostContract>>(`/contentTypes/blogPost/contentItems?$filter=permalink eq '${permalink}'`);

        if (blogPostOfBlogPosts.count > 0) {
            return blogPostOfBlogPosts.value[0];
        }
        else {
            return null;
        }
    }

    public async getBlogPostByKey(key: string): Promise<BlogPostContract> {
        return await this.smapiClient.get<BlogPostContract>(key);
    }

    public async search(pattern: string): Promise<BlogPostContract[]> {
        const blogPostOfBlogPosts = await this.smapiClient.get<Page<BlogPostContract>>(`/contentTypes/blogPost/contentItems?$orderby=title&$filter=contains(title,'${pattern}')`);
        return blogPostOfBlogPosts.value;
    }

    public async deleteBlogPost(blogPost: BlogPostContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.delete(blogPost.contentKey, headers);
        await this.smapiClient.delete(blogPost.key, headers);
    }

    public async createBlogPost(url: string, title: string, description: string, keywords): Promise<BlogPostContract> {
        const identifier = Utils.guid();
        const blogPostKey = `${blogPostsPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const blogPost: BlogPostContract = {
            key: blogPostKey,
            title: title,
            description: description,
            keywords: keywords,
            contentKey: contentKey,
            permalink: "/new"
        };

        const block = await this.blockService.getBlockByKey(templateBlockKey);
        const template = await this.blockService.getBlockContent(block.key);

        await this.smapiClient.put<BlogPostContract>(blogPostKey, [], blogPost);
        await this.smapiClient.put<any>(contentKey, [], template);

        return blogPost;
    }

    public async updateBlogPost(blogPost: BlogPostContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(blogPost.key, headers, blogPost);
    }

    public async getBlogPostContent(blogPostKey: string): Promise<Contract> {
        const blogPost = await this.smapiClient.get<BlogPostContract>(blogPostKey);
        const document = await this.smapiClient.get<any>(blogPost.contentKey);
        return document;
    }

    public async updateBlogPostContent(blogPostKey: string, content: Contract): Promise<void> {
        const blogPost = await this.smapiClient.get<BlogPostContract>(blogPostKey);

        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(blogPost.contentKey, headers, content);
    }
}