import * as React from 'react';
import { isEqual, isEmpty, debounce } from 'lodash';
import { Resolve } from '@paperbits/react/decorators';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { LabelWithInfo } from '../utils/components/labelWithInfo';
import { REQUIRED, UNIQUE_REQUIRED, validateField } from '../utils/validator';
import { reservedPermalinks } from '../../constants';

interface PageLayoutModalState {
    layout: LayoutContract,
    showDeleteConfirmation: boolean,
    copyLayout: boolean,
    errors: object
}

interface PageLayoutModalProps {
    layout: LayoutContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

const textFieldStyles = { root: { paddingBottom: 15 } };

export class PageLayoutDetailsModal extends React.Component<PageLayoutModalProps, PageLayoutModalState> {
    @Resolve('layoutService')
    public layoutService: ILayoutService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: PageLayoutModalProps) {
        super(props);

        this.state = {
            layout: this.props.layout ?? { permalinkTemplate: '/new-layout', title: 'New layout' },
            showDeleteConfirmation: false,
            copyLayout: false,
            errors: {}
        }
    }

    onInputChange = async (field: string, newValue: string, validationType?: string): Promise<void> => {
        this.setState({
            layout: {
                ...this.state.layout,
                [field]: newValue
            }
        });

        this.runValidation(field, newValue, validationType);
    }

    runValidation = debounce(async (field: string, newValue: string, validationType?: string): Promise<void> => {
        let errorMessage = '';
        let errors = {};

        if (field === 'permalinkTemplate') {
            errorMessage = await this.validatePermalink(newValue);
        } else if (validationType) {
            errorMessage = validateField(validationType, newValue);
        }

        if (errorMessage !== '' && !this.state.errors[field]) {
            errors = { ...this.state.errors, [field]: errorMessage };
        } else if (errorMessage === '' && this.state.errors[field]) {
            const { [field as keyof typeof this.state.errors]: error, ...rest } = this.state.errors;
            errors = rest;
        } else {
            errors = this.state.errors;
        }

        this.setState({ errors });
    }, 300)

    validatePermalink = async (permalink: string): Promise<string> => {
        if (!this.state.copyLayout && permalink === this.props.layout?.permalinkTemplate) return '';

        const isPermalinkNotDefined = permalink ? !(await this.layoutService.getLayoutByPermalinkTemplate(permalink)) : true && !reservedPermalinks.includes(permalink);
        const errorMessage = validateField(UNIQUE_REQUIRED, permalink, isPermalinkNotDefined);

        return errorMessage;
    }

    deleteLayout = async (): Promise<void> => {
        await this.layoutService.deleteLayout(this.state.layout);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    copyLayout = async (): Promise<void> => {
        this.setState({ copyLayout: true, layout: {
            ...this.state.layout,
            permalinkTemplate: this.state.layout.permalinkTemplate + '-copy',
            title: this.state.layout.title + ' (copy)'
        }});
    }

    saveLayout = async (): Promise<void> => {
        // TODO: find a root cause of an ability to click Save button when name is empty or permalink is not unique
        const permalinkError = await this.validatePermalink(this.state.layout.permalinkTemplate);
        const titleError = validateField(REQUIRED, this.state.layout.title);
 
        if (permalinkError || titleError) {
            const errors = {};
            if (permalinkError) errors['permalinkTemplate'] = permalinkError;
            if (titleError) errors['title'] = titleError;

            this.setState({ errors });
            return;
        }

        if (this.props.layout && !this.state.copyLayout) {
            await this.layoutService.updateLayout(this.state.layout);
        } else {
            const newLayout = this.state.layout;
            await this.layoutService.createLayout(newLayout.title, newLayout.description, newLayout.permalinkTemplate);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.layout.title}
                    onConfirm={this.deleteLayout.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" block nowrap className="admin-modal-header-text">Layout / { this.state.layout.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveLayout()}
                            disabled={isEqual(this.props.layout, this.state.layout) || !isEmpty(this.state.errors)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.layout && this.props.layout.permalinkTemplate !== '/' &&
                        <>
                            <CommandBarButton
                                iconProps={deleteIcon}
                                text="Delete"
                                onClick={() => this.setState({ showDeleteConfirmation: true })}
                                className="command-bar-button"
                            />
                            <CommandBarButton
                                iconProps={copyIcon}
                                text="Copy layout"
                                onClick={() => this.copyLayout()}
                                className="command-bar-button"
                            />
                        </>
                    }
                    <TextField
                        label="Title"
                        placeholder="Enter the layout name"
                        value={this.state.layout.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue, REQUIRED)}
                        errorMessage={this.state.errors['title'] ?? ''}
                        styles={textFieldStyles}
                        required
                    />
                    <TextField
                        onRenderLabel={() => 
                            <LabelWithInfo
                                label="Permalink path template"
                                info={`Permalink path template determines the pages that are displayed using this layout. For example, "*" would apply this layout to all pages, "/contact" would apply this layout only to a page with permalink path "/contact", and "/contact/*" would apply this layout to all pages with permalink starting with "/contact/". `}
                                required
                            />
                        }
                        ariaLabel="Permalink path template"
                        placeholder="Enter the permalink path template"
                        value={this.state.layout.permalinkTemplate}
                        onChange={(event, newValue) => this.onInputChange('permalinkTemplate', newValue)}
                        errorMessage={this.state.errors['permalinkTemplate'] ?? ''}
                        disabled={this.props.layout?.permalinkTemplate === '/' ? true : false}
                        styles={textFieldStyles}
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.layout.description}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                    />
                </div>
            </Modal>
        </>
    }
}