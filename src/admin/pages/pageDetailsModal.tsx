import * as React from 'react';
import { isEqual, isEmpty, debounce } from 'lodash';
import { Resolve } from '@paperbits/react/decorators';
import { IPageService, PageContract } from '@paperbits/common/pages';
import { PermalinkService } from '@paperbits/common/permalinks';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { LabelWithInfo } from '../utils/components/labelWithInfo';
import { REQUIRED, UNIQUE_REQUIRED, validateField } from '../utils/validator';
import { reservedPermalinks } from '../../constants';

interface PageDetailsModalState {
    page: PageContract,
    showDeleteConfirmation: boolean,
    copyPage: boolean,
    errors: object
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
    
    @Resolve('permalinkService')
    public permalinkService: PermalinkService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: PageDetailsModalProps) {
        super(props);

        this.state = {
            page: this.props.page ?? { permalink: '/new-page', title: 'New page', description: '', keywords: '' },
            showDeleteConfirmation: false,
            copyPage: false,
            errors: {}
        }
    }

    onInputChange = async (field: string, newValue: string, validationType?: string): Promise<void> => {
        let permalink = null;

        if (!this.props.page && field === 'title') {
            permalink = newValue.replace(/\s+/g, '-').toLowerCase();

            this.setState({ page: {
                ...this.state.page,
                'title': newValue,
                'permalink': '/' + permalink
            }});
        } else {
            this.setState({ page: {
                ...this.state.page,
                [field]: newValue
            }});
        }

        this.runValidation(field, newValue, validationType, permalink);
    }

    runValidation = debounce(async (field: string, newValue: string, validationType?: string, permalink?: string): Promise<void> => {
        let errorMessage = '';
        let permalinkErrorMessage = '';
        let errors = {};

        if (field === 'permalink') {
            errorMessage = await this.validatePermalink(newValue);
        } else if (validationType) {
            errorMessage = validateField(validationType, newValue);
        }

        if (permalink !== null) {
            permalinkErrorMessage = await this.validatePermalink('/' + permalink);
        }

        if (errorMessage !== '' && !this.state.errors[field]) {
            errors = { ...this.state.errors, [field]: errorMessage };
        } else if (errorMessage === '' && this.state.errors[field]) {
            const { [field as keyof typeof this.state.errors]: error, ...rest } = this.state.errors;
            errors = rest;
        } else {
            errors = this.state.errors;
        }

        if (!this.props.page && field === 'title') {
            if (permalinkErrorMessage !== '' && !errors['permalink']) {
                errors = { ...errors, permalink: permalinkErrorMessage };
            } else if (permalinkErrorMessage === '' && errors['permalink']) {
                const { ['permalink' as keyof typeof errors]: error, ...rest } = errors;
                errors = rest;
            }
        }
        
        this.setState({ errors });
    }, 300);

    validatePermalink = async (permalink: string): Promise<string> => {
        if (!this.state.copyPage && permalink === this.props.page?.permalink) return '';

        const isPermalinkNotDefined = await this.permalinkService.isPermalinkDefined(permalink) && !reservedPermalinks.includes(permalink);
        const errorMessage = validateField(UNIQUE_REQUIRED, permalink, isPermalinkNotDefined);

        return errorMessage;
    }

    deletePage = async (): Promise<void> => {
        await this.pageService.deletePage(this.state.page);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    copyPage = async (): Promise<void> => {
        this.setState({ copyPage: true, page: { 
            ...this.state.page,
            permalink: this.state.page.permalink + '-copy',
            title: this.state.page.title + ' (copy)'
        }});
    }

    savePage = async (): Promise<void> => {
        // TODO: find a root cause of an ability to click Save button when name is empty or permalink is not unique
        const permalinkError = await this.validatePermalink(this.state.page.permalink);
        const titleError = validateField(REQUIRED, this.state.page.title);

        if (permalinkError || titleError) {
            const errors = {};
            if (permalinkError) errors['permalink'] = permalinkError;
            if (titleError) errors['title'] = titleError;

            this.setState({ errors });
            return;
        }

        if (this.props.page && !this.state.copyPage) {
            await this.pageService.updatePage(this.state.page);
        } else {
            const newPage = this.state.page;
            await this.pageService.createPage(newPage.permalink, newPage.title, newPage.description, newPage.keywords);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
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
                    <Text as="h2" block nowrap className="admin-modal-header-text">Page / { this.state.page.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.savePage()}
                            disabled={isEqual(this.props.page, this.state.page) || !isEmpty(this.state.errors)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {(this.props.page && !reservedPermalinks.includes(this.props.page.permalink)) &&
                        <>
                            <CommandBarButton
                                iconProps={deleteIcon}
                                text="Delete"
                                onClick={() => this.setState({ showDeleteConfirmation: true })}
                                className="command-bar-button"
                            />
                            <CommandBarButton
                                iconProps={copyIcon}
                                text="Copy page"
                                onClick={() => this.copyPage()}
                                className="command-bar-button"
                            />
                        </>
                    }
                    <TextField
                        onRenderLabel={() => 
                            <LabelWithInfo
                                label="Name"
                                info="This is how the page name will be displayed in the site menu."
                                required
                            />}
                        ariaLabel="Name"
                        placeholder="Enter the page name"
                        value={this.state.page.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue, REQUIRED)}
                        errorMessage={this.state.errors['title'] ?? ''}
                        styles={textFieldStyles}
                    />
                    <TextField
                        onRenderLabel={() => 
                            <LabelWithInfo
                                label="Permalink path"
                                info={`URL path of the page that's -appended to the developer portal hostname. For example, "/contact" would make this page available under "www.contoso.com/contact". Permalink path needs to be unique for every page and is used to match it against a defined layout.`} 
                                required
                            />
                        }
                        ariaLabel="Permalink path"
                        placeholder="Enter the permalink path"
                        value={this.state.page.permalink}
                        onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                        errorMessage={this.state.errors['permalink'] ?? ''}
                        disabled={reservedPermalinks.includes(this.props.page?.permalink)}
                        styles={textFieldStyles}
                    />
                    <TextField
                        onRenderLabel={() => <LabelWithInfo label="Description" info="This description helps search engines and users understand the content and purpose of this page." />}
                        ariaLabel="Description"
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