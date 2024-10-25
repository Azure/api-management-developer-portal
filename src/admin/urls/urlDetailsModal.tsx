import * as React from 'react';
import { isEqual, isEmpty, debounce } from 'lodash';
import { Resolve } from '@paperbits/react/decorators';
import { IUrlService, UrlContract } from '@paperbits/common/urls';
import { PermalinkService } from '@paperbits/common/permalinks';
import { EventManager } from '@paperbits/common/events';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { REQUIRED, UNIQUE_REQUIRED, URL_REQUIRED, URL_REQUIRED_MESSAGE, validateField } from '../utils/validator';
import { reservedPermalinks } from '../../constants';

interface UrlDetailsModalState {
    url: UrlContract,
    showDeleteConfirmation: boolean,
    errors: object
}

interface UrlDetailsModalProps {
    url: UrlContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const textFieldStyles = { root: { paddingBottom: 15 } };

export class UrlDetailsModal extends React.Component<UrlDetailsModalProps, UrlDetailsModalState> {
    @Resolve('urlService')
    public urlService: IUrlService;

    @Resolve('permalinkService')
    public permalinkService: PermalinkService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: UrlDetailsModalProps) {
        super(props);

        this.state = {
            url: this.props.url ?? { permalink: 'https://', title: 'New URL', description: '' },
            showDeleteConfirmation: false,
            errors: {}
        }
    }

    onInputChange = async (field: string, newValue: string, validationType?: string): Promise<void> => {
        this.setState({
            url: {
                ...this.state.url,
                [field]: newValue
            }
        });

        this.runValidation(field, newValue, validationType);
    }

    runValidation = debounce(async (field: string, newValue: string, validationType?: string): Promise<void> => {
        let errorMessage = '';
        let errors = {};

        if (field === 'permalink') {
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
        if (permalink === this.props.url?.permalink) return '';

        const isPermalinkNotDefined = await this.permalinkService.isPermalinkDefined(permalink) && !reservedPermalinks.includes(permalink);
        let errorMessage = validateField(UNIQUE_REQUIRED, permalink, isPermalinkNotDefined);

        if (errorMessage === '') errorMessage = validateField(URL_REQUIRED, permalink);

        return errorMessage;
    }

    deleteUrl = async (): Promise<void> => {
        await this.urlService.deleteUrl(this.state.url);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    saveUrl = async (): Promise<void> => {
        if (this.state.url.permalink === 'https://') {
            this.setState({ errors: { permalink: URL_REQUIRED_MESSAGE } });
            return;
        }

        if (this.props.url) {
            await this.urlService.updateUrl(this.state.url);
        } else {
            const newUrl = this.state.url;
            await this.urlService.createUrl(newUrl.permalink, newUrl.title, newUrl.description);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.url.title}
                    onConfirm={this.deleteUrl.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" block nowrap className="admin-modal-header-text">URL / { this.state.url.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.saveUrl()}
                            disabled={isEqual(this.props.url, this.state.url) || !isEmpty(this.state.errors)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.url && 
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                            className="command-bar-button"
                        />
                    }
                    <TextField
                        label="Title"
                        value={this.state.url.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue, REQUIRED)}
                        errorMessage={this.state.errors['title'] ?? ''}
                        styles={textFieldStyles}
                        required
                    />
                    <TextField
                        label="Permalink"
                        value={this.state.url.permalink}
                        onChange={(event, newValue) => this.onInputChange('permalink', newValue)}
                        errorMessage={this.state.errors['permalink'] ?? ''}
                        styles={textFieldStyles}
                        required
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.url.description}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                        styles={textFieldStyles}
                    />
                </div>
            </Modal>
        </>
    }
}