import * as React from 'react';
import { IPageService, PageContract, PageService } from "@paperbits/common/pages";
import { Query, Operator, Page } from "@paperbits/common/persistence";
import { Logger } from "@paperbits/common/logging";
import { ILocaleService } from '@paperbits/common/localization';
import { IObjectStorage } from '@paperbits/common/persistence';
import { IBlockService } from '@paperbits/common/blocks';
import { Resolve } from "@paperbits/react/decorators"
import { Router } from "@paperbits/common/routing";

// const Pages = () => {
//     @Resolve('p')
    
//     //const pageService = new PageService({ addObject }: IObjectStorage, {seacrh }: IBlockService);
//     // query = Query.from().orderBy('title');
//     //const pagesSearchResult = await pageService.search(query);
//     //console.log(pagesSearchResult);
//     //const logger = new Logger();

//    // console.log(logger.trackError({ name: 'error', message: "kdkdk"}));

//     const pages = [];

//     return (
//         <div>
//             ssss
//         </div>
//     )
// }

class Pages extends React.Component<{}, {}> {
    @Resolve('pageService')
    public pageService:IPageService;

    constructor(props) {
        super(props);
    }

    loadPages = () => {
        const query = Query.from().orderBy('title');
        const pagesSearchResult = this.pageService.search(query);
        console.log(pagesSearchResult);
    }

    render() {
        return <div onClick={this.loadPages}>Click me</div>
    }
}

export default Pages;