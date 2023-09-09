import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { IPopupService, PopupContract } from '@paperbits/common/popups';
import { EventManager, Events } from '@paperbits/common/events';
import { ViewManager } from '@paperbits/common/ui';
import { CommandBarButton, DefaultButton, IIconProps, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { REQUIRED, validateField } from '../utils/validator';
import { mobileBreakpoint } from '../utils/variables';

interface PopupDetailsModalState {
    popup: PopupContract,
    showDeleteConfirmation: boolean
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
            showDeleteConfirmation: false
        }
    }

    onInputChange = async (field: string, newValue: string): Promise<void> => {
        this.setState({
            popup: {
                ...this.state.popup,
                [field]: newValue
            }
        });
    }

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
                    <Text block nowrap className="admin-modal-header-text">Pop-up / { this.state.popup.title }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        <PrimaryButton
                            text="Save"
                            onClick={() => this.savePopup()}
                            disabled={JSON.stringify(this.props.popup) === JSON.stringify(this.state.popup)}
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
                            styles={{ root: { height: 44, marginBottom: 30 } }}
                        />
                    }
                    <TextField
                        label="Title"
                        value={this.state.popup.title}
                        onChange={(event, newValue) => this.onInputChange('title', newValue)}
                        styles={textFieldStyles}
                        onGetErrorMessage={(value) => validateField(REQUIRED, value)}
                    />
                    <TextField
                        label="Description"
                        multiline
                        autoAdjustHeight
                        value={this.state.popup.description}
                        onChange={(event, newValue) => this.onInputChange('description', newValue)}
                        styles={textFieldStyles}
                    />
                    <DefaultButton
                        text="Open pop-up"
                        onClick={() => this.openPopup()}
                    />
                </div>
            </Modal>
        </>
    }
}