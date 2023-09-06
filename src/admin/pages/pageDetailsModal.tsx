import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { LabelWithInfo } from '../utils/components/labelWithInfo';

interface PageDetailsModalState {
    page: PageContract,
    showDeleteConfirmation: boolean,
    copyPage: boolean
}

interface PageDetailsModalProps {
    page: PageContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

const textFieldStyles = { root: { paddingBottom: 15 } };

export class PageDetailsModal extends React.Component<PageDetailsModalProps, PageDetailsModalState> {
    @Resolve('pageService')
    public pageService: IPageService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: PageDetailsModalProps) {
        super(props);

        this.state = {
            page: this.props.page ?? { permalink: '/new-page', title: 'New page', description: '', keywords: '' },
            showDeleteConfirmation: false,
            copyPage: false
        }
    }

    onInputChange = async (field: string, newValue: string) => {
        if (!this.props.page && field === 'title') {
            const permalink = newValue.replace(/\s+/g, '-').toLowerCase();

            this.setState({
                page: {
                    ...this.state.page,
                    'title': newValue,
                    'permalink': '/' + permalink
                }
            });
        } else {
            this.setState({
                page: {
                    ...this.state.page,
                    [field]: newValue
                }
            });
        }
    }

    deletePage = async () => {
        await this.pageService.deletePage(this.state.page);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    copyPage = async () => {
        this.setState({ copyPage: true, page: { 
            ...this.state.page,
            permalink: this.state.page.permalink + '-copy',
            title: this.state.page.title + ' (copy)'
        }});
    }

    savePage = async () => {
        if (this.props.page && !this.state.copyPage) {
            await this.pageService.updatePage(this.state.page);
        } else {
            const newPage = this.state.page;
            await this.pageService.createPage(newPage.permalink, newPage.title, newPage.description, newPage.keywords);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render() {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.page.title}
                    onConfirm={this.deletePage.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text block nowrap className="admin-modal-header-text">Page / { this.state.page.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.savePage()}
                            disabled={JSON.stringify(this.props.page) === JSON.stringify(this.state.page)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.page && 
                        <>
                            <CommandBarButton
                                iconProps={deleteIcon}
                                text="Delete"
                                onClick={() => this.setState({ showDeleteConfirmation: true })}
                                styles={{ root: { height: 44, marginBottom: 30 } }}
                            />
                            <CommandBarButton
                                iconProps={copyIcon}
                                text="Copy page"
                                onClick={() => this.copyPage()}
                                styles={{ root: { height: 44, marginBottom: 30 } }}
                            />
                        </>
                    }
                    <TextField
                        onRenderLabel={() => <LabelWithInfo label="Name" info="This is how the page name will be displayed in the site menu." />}
                        value={this.state.page.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Permalink"
                        value={this.state.page.permalink}
                        onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        onRenderLabel={() => <LabelWithInfo label="Description" info="Add text about the page and its content as if you were describing it to someone who is blind.Add text about the page and its content as if you were describing it to someone who is blind." />}
                        multiline
                        autoAdjustHeight
                        value={this.state.page.description}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Keywords"
                        placeholder="e.g. about"
                        value={this.state.page.keywords}
                        onChange={(event, newValue) => this.onInputChange('keywords', newValue)}
                    />
                </div>
            </Modal>
        </>
    }
}