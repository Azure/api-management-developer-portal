import * as React from 'react';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { Resolve } from '@paperbits/react/decorators';
import { Router } from '@paperbits/common/routing';
import { Pivot, PivotItem, IIconProps, Stack } from '@fluentui/react';
import { TextField } from '@fluentui/react/lib/TextField';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { BackButton } from '../utils/components/backButton';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';

interface PageDetailsState {
    page: PageContract,
    showDeleteConfirmation: boolean
}

interface PageDetailsProps {
    page: PageContract,
    onBackButtonClick: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

export class PageDetails extends React.Component<PageDetailsProps, PageDetailsState> {
    @Resolve('pageService')
    public pageService: IPageService;

    @Resolve('router')
    public router: Router;

    constructor(props: PageDetailsProps) {
        super(props);

        this.state = {
            page: this.props.page,
            showDeleteConfirmation: false
        }
    }

    onInputChange = async (field: string, newValue: string) => {
        this.setState({
            page: {
                ...this.state.page,
                [field]: newValue
            }
        },
            async () => {
                if (field === 'permalink') this.router.updateHistory(newValue);
                await this.pageService.updatePage(this.state.page)
            });
    }

    deletePage = async () => {
        await this.pageService.deletePage(this.state.page);

        // TODO: add success message!

        this.props.onBackButtonClick();
        this.router.navigateTo('/');
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    copyPage = async () => {
        const copiedPage = await this.pageService.copyPage(this.state.page.key);
        this.setState({ page: copiedPage });
        this.router.navigateTo(copiedPage.permalink);
    }

    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.page.title}
                    onDelete={this.deletePage.bind(this)}
                    closeDeleteConfirmation={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <BackButton onClick={this.props.onBackButtonClick} />
            <Pivot aria-label="Page details tabs">
                <PivotItem headerText="Design">
                    <Stack styles={{ root: { margin: '20px 0' } }}>
                        <TextField label="Title"
                            value={this.state.page.title}
                            onChange={(event, newValue) => this.onInputChange('title', newValue)}
                        />
                        <TextField label="Permalink"
                            value={this.state.page.permalink}
                            onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                        />
                        <TextField label="Description"
                            multiline
                            autoAdjustHeight
                            value={this.state.page.description}
                            onChange={(event, newValue) => this.onInputChange('descriptiion', newValue)}
                        />
                        <TextField label="Keywords"
                            placeholder="e.g. about"
                            value={this.state.page.keywords}
                            onChange={(event, newValue) => this.onInputChange('keywords', newValue)}
                        />
                    </Stack>
                    <Stack horizontal styles={{ root: { height: 44 } }}>
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete page"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                        />
                        <CommandBarButton
                            iconProps={copyIcon}
                            text="Copy page"
                            onClick={() => this.copyPage()}
                        />
                    </Stack>
                </PivotItem>
                <PivotItem headerText="Access">
                    {/* <Label styles={labelStyles}>Page layout</Label> */}
                </PivotItem>
            </Pivot>
        </>
    }
}