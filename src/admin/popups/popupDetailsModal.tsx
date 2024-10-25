import * as React from 'react';
import { isEqual, isEmpty, debounce } from 'lodash';
import { Resolve } from '@paperbits/react/decorators';
import { IPopupService, PopupContract } from '@paperbits/common/popups';
import { EventManager, Events } from '@paperbits/common/events';
import { ViewManager } from '@paperbits/common/ui';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { REQUIRED, validateField } from '../utils/validator';
import { mobileBreakpoint } from '../../constants';

interface PopupDetailsModalState {
    popup: PopupContract,
    showDeleteConfirmation: boolean,
    errors: object
}

interface PopupDetailsModalProps {
    popup: PopupContract,
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const textFieldStyles = { root: { paddingBottom: 15 } };

export class PopupDetailsModal extends React.Component<PopupDetailsModalProps, PopupDetailsModalState> {
    @Resolve('popupService')
    public popupService: IPopupService;

    @Resolve('eventManager')
    public eventManager: EventManager;

    @Resolve('viewManager')
    public viewManager: ViewManager;

    constructor(props: PopupDetailsModalProps) {
        super(props);

        this.state = {
            popup: this.props.popup ?? { title: 'New pop-up', description: '' },
            showDeleteConfirmation: false,
            errors: {}
        }
    }

    onInputChange = async (field: string, newValue: string, validationType?: string): Promise<void> => {
        this.setState({
            popup: {
                ...this.state.popup,
                [field]: newValue
            }
        });

        this.runValidation(field, newValue, validationType);
    }

    runValidation = debounce(async (field: string, newValue: string, validationType?: string): Promise<void> => {
        let errorMessage = '';
        let errors = {};

        if (validationType) {
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

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    openPopup = (): void => {
        const hostDocument = this.viewManager.getHostDocument();
        hostDocument.dispatchEvent(new CustomEvent(Events.PopupRequest, { detail: this.state.popup.key }));
        this.props.onDismiss();
        if (window.innerWidth < mobileBreakpoint) document.getElementById('admin-left-panel').classList.add('hidden');
    }

    deletePopup = async (): Promise<void> => {
        await this.popupService.deletePopup(this.state.popup);

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    savePopup = async (): Promise<void> => {
        if (this.props.popup) {
            await this.popupService.updatePopup(this.state.popup);
        } else {
            const newPopup = await this.popupService.createPopup(this.state.popup.title, this.state.popup.description);
            this.eventManager.dispatchEvent(Events.PopupCreated, newPopup.key);
        }

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    render(): JSX.Element {
        return <>
            {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.popup.title}
                    onConfirm={this.deletePopup.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" block nowrap className="admin-modal-header-text">Pop-up / { this.state.popup.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.savePopup()}
                            disabled={isEqual(this.props.popup, this.state.popup) || !isEmpty(this.state.errors)}
                        />
                        <DefaultButton
                            text="Discard"
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.props.popup && 
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                            className="command-bar-button"
                        />
                    }
                    <TextField
                        label="Title"
                        value={this.state.popup.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue, REQUIRED)}
                        errorMessage={this.state.errors['title'] ?? ''}
                        styles={textFieldStyles}
                        required
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.popup.description}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                        styles={textFieldStyles}
                    />
                    {this.props.popup && 
                        <DefaultButton
                            text="Open pop-up"
                            onClick={() => this.openPopup()}
                        />
                    }
                </div>
            </Modal>
        </>
    }
}