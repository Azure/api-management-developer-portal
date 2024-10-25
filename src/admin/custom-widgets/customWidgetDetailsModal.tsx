import * as React from 'react';
import * as Utils from '@paperbits/common/utils';
import { Resolve } from '@paperbits/react/decorators';
import { IWidgetService } from '@paperbits/common/widgets';
import { EventManager } from '@paperbits/common/events';
import { KnockoutComponentBinder } from '@paperbits/core/ko/knockoutComponentBinder';
import { buildBlobConfigPath, buildBlobDataPath } from '@azure/api-management-custom-widgets-tools';
import { widgetFolderName, displayNameToName } from '@azure/api-management-custom-widgets-scaffolder';
import { CustomWidgetEditorViewModel, CustomWidgetViewModel, CustomWidgetViewModelBinder } from '../../components/custom-widget/ko';
import { CustomWidgetHandlers, CustomWidgetModelBinder, TCustomWidgetConfig, widgetCategory } from '../../components/custom-widget';
import { CustomWidgetModel } from '../../components/custom-widget/customWidgetModel';
import fallbackUi from '!!raw-loader!../../components/custom-widget-list/fallbackUi.html';
import { MapiBlobStorage } from '../../persistence';
import { ChoiceGroup, CommandBarButton, DefaultButton, IChoiceGroupOption, Icon, IIconProps, Link, Modal, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';
import { CopyableTextField } from '../utils/components/copyableTextField';
import { UNIQUE_REQUIRED, validateField } from '../utils/validator';

interface CustomWidgetDetailsModalState {
    isEdit: boolean,
    customWidget: TCustomWidgetConfig,
    saveButtonDisabled: boolean,
    showInstructions: boolean,
    showDeleteConfirmation: boolean
}

interface CustomWidgetDetailsModalProps {
    customWidget: TCustomWidgetConfig,
    customWidgets: TCustomWidgetConfig[],
    onDismiss: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const textFieldStyles = { root: { paddingBottom: 15 } };
const listItemStyles = { root: { marginBottom: 10 } };

const technology: IChoiceGroupOption[] = [
    { key: 'typescript', text: 'TypeScript', styles: { field: { padding: 0 }} },
    { key: 'react', text: 'React', styles: { field: { padding: 0 }} },
    { key: 'vue', text: 'Vue', styles: { field: { padding: 0 }} }
];

export class CustomWidgetDetailsModal extends React.Component<CustomWidgetDetailsModalProps, CustomWidgetDetailsModalState> {
    @Resolve('widgetService')
    public widgetService: IWidgetService;

    @Resolve('blobStorage')
    public blobStorage: MapiBlobStorage;

    @Resolve('eventManager')
    public eventManager: EventManager;

    constructor(props: CustomWidgetDetailsModalProps) {
        super(props);

        this.state = {
            isEdit: !!this.props.customWidget,
            customWidget: this.props.customWidget ?? { name: 'new-custom-widget', displayName: 'New custom widget', technology: 'typescript' },
            saveButtonDisabled: false,
            showInstructions: false,
            showDeleteConfirmation: false
        }
    }

    onInputChange = async (field: string, newValue: string): Promise<void> => {
        this.setState({
            customWidget: {
                ...this.state.customWidget,
                [field]: newValue
            }
        });
    }

    deleteCustomWidget = async (): Promise<void> => {
        const blobsToDelete = await this.blobStorage.listBlobs(buildBlobDataPath(this.state.customWidget.name));
        blobsToDelete.push(buildBlobConfigPath(this.state.customWidget.name));
        await Promise.all(blobsToDelete.map(blobKey => this.blobStorage.deleteBlob(blobKey)));

        this.eventManager.dispatchEvent('onSaveChanges');
        this.props.onDismiss();
    }

    closeDeleteConfirmation = (): void => {
        this.setState({ showDeleteConfirmation: false });
    }

    saveCustomWidget = async (): Promise<void> => {
        const name = displayNameToName(this.state.customWidget.displayName);
        const config: TCustomWidgetConfig = {
            name,
            displayName: this.state.customWidget.displayName,
            technology: this.state.customWidget.technology
        };

        const content = Utils.stringToUnit8Array(JSON.stringify(config));
        await this.blobStorage.uploadBlob(buildBlobConfigPath(name), content);

        const fallbackUiUnit8 = Utils.stringToUnit8Array(fallbackUi);
        const dataPath = buildBlobDataPath(name);
        await this.blobStorage.uploadBlob(`/${dataPath}index.html`, fallbackUiUnit8);
        await this.blobStorage.uploadBlob(`/${dataPath}editor.html`, fallbackUiUnit8);

        this.widgetService.registerWidget(name, {
            modelDefinition: CustomWidgetModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomWidgetViewModel,
            modelBinder: CustomWidgetModelBinder,
            viewModelBinder: CustomWidgetViewModelBinder
        });

        this.widgetService.registerWidgetEditor(name, {
            displayName: this.state.customWidget.displayName,
            category: widgetCategory,
            iconClass: "widget-icon widget-icon-component",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomWidgetEditorViewModel,
            handlerComponent: new CustomWidgetHandlers(config)
        });

        this.eventManager.dispatchEvent('onSaveChanges');
        this.setState({ isEdit: true, showInstructions: true });
    }

    validateCustomWidgetName = (displayName: string): string => {
        if (this.props.customWidget) return '';

        const name = displayNameToName(displayName);
        const isValidName = !!!this.props.customWidgets.find((config) => config.name === name);
        const errorMessage = validateField(UNIQUE_REQUIRED, displayName, isValidName);

        this.setState({ saveButtonDisabled: errorMessage.length !== 0 });

        return errorMessage;
    }

    render(): JSX.Element {
        return <>
            {this.state.showDeleteConfirmation &&
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.customWidget.displayName}
                    onConfirm={this.deleteCustomWidget.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)}
                />
            }
            <Modal
                isOpen={true}
                onDismiss={this.props.onDismiss}
                containerClassName="admin-modal"
            >
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className="admin-modal-header">
                    <Text as="h2" block nowrap className="admin-modal-header-text">Custom widget / { this.state.customWidget.displayName }</Text>
                    <Stack horizontal tokens={{ childrenGap: 20 }}>
                        {!this.state.isEdit &&
                            <PrimaryButton
                                text="Save"
                                onClick={() => this.saveCustomWidget()}
                                disabled={this.state.saveButtonDisabled}
                            />
                        }
                        <DefaultButton
                            text={this.state.isEdit ? 'Close' : 'Discard'}
                            onClick={this.props.onDismiss}
                        />
                    </Stack>
                </Stack>
                <div className="admin-modal-content">
                    {this.state.isEdit &&
                        <CommandBarButton
                            iconProps={deleteIcon}
                            text="Delete"
                            onClick={() => this.setState({ showDeleteConfirmation: true })}
                            styles={{ root: { height: 44, marginBottom: 30 } }}
                        />
                    }
                    <TextField
                        label="Name"
                        value={this.state.customWidget.displayName}
                        onChange={(event, newValue) => this.onInputChange('displayName', newValue)}
                        styles={textFieldStyles}
                        onGetErrorMessage={(value) => this.validateCustomWidgetName(value)}
                        disabled={this.state.isEdit}
                        required
                    />
                    <ChoiceGroup
                        label="Technology"
                        options={technology}
                        selectedKey={this.state.customWidget.technology}
                        onChange={(event, option) => this.onInputChange('technology', option.key)}
                        disabled={this.state.isEdit}
                        styles={{ label: { padding: 0 } }}
                    />
                    {this.state.isEdit &&
                        <Stack horizontal onClick={() => this.setState({ showInstructions: !this.state.showInstructions })} styles={{ root: { cursor: 'pointer', marginTop: 20 } }}>
                            <Icon
                                iconName="ChevronDown"
                                className={`collapsible-arrow ${this.state.showInstructions ? 'opened' : 'closed'}`}
                            />
                            <Text styles={{ root: { fontWeight: 'bold' } }}>Get started with the development</Text>
                        </Stack>
                    }
                    <Stack className={`collapsible-section${!this.state.showInstructions ? ' hidden' : ''}`}>
                        <Text block styles={{ root: { paddingTop: 20 } }}>
                            Follow the steps below to create, implement, and deploy a custom widget. 
                            <Link href="https://aka.ms/apimdocs/portal/customwidgets" target="_blank">Learn more</Link>.
                        </Text>
                        <ol>
                            <li>
                                <Text block styles={listItemStyles}>Open the terminal, navigate to the location where you want to save the widget, and execute the following command to download the code scaffold:</Text>
                                <CopyableTextField
                                    fieldLabel="downloading the code scaffold command"
                                    showLabel={false}
                                    copyableValue={`npx @azure/api-management-custom-widgets-scaffolder@latest --displayName="${this.state.customWidget.displayName}" --technology="${this.state.customWidget.technology}" --openUrl="${window.location.origin}"`}
                                />
                            </li>
                            <li>
                                <Text block styles={listItemStyles}>Navigate to the newly created folder with the widget's code scaffold:</Text>
                                <CopyableTextField
                                    fieldLabel="navigating to the new folder command"
                                    showLabel={false}
                                    copyableValue={`cd ${widgetFolderName(this.state.customWidget.name)}`}
                                />
                            </li>
                            <li>
                                <Text block styles={listItemStyles}>Open the folder in the code editor of choice. For example:</Text>
                                <CopyableTextField
                                    fieldLabel="opening the code command"
                                    showLabel={false}
                                    copyableValue="code ."
                                />
                            </li>
                            <li>
                                <Text block styles={listItemStyles}>Install the dependencies:</Text>
                                <CopyableTextField
                                    fieldLabel="dependencies installation command"
                                    showLabel={false}
                                    copyableValue="npm install"
                                />
                            </li>
                            <li>
                                <Text block styles={listItemStyles}>Start the project:</Text>
                                <CopyableTextField
                                    fieldLabel="project starting command"
                                    showLabel={false}
                                    copyableValue="npm start"
                                />
                            </li>
                            <li>
                                <Text block styles={textFieldStyles}>Implement the code of the widget and test it locally.</Text>
                            </li>
                            <li>
                                <Text block styles={listItemStyles}>Deploy the custom widget to the developer portal in your API Management service:</Text>
                                <CopyableTextField
                                    fieldLabel="deploying the custom widget command"
                                    showLabel={false}
                                    copyableValue="npm run deploy"
                                />
                            </li>
                        </ol>
                    </Stack>
                </div>
            </Modal>
        </>
    }
}