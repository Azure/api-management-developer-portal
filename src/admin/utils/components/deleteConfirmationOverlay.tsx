import * as React from 'react';
import { Stack, Layer, Overlay, Popup, mergeStyleSets, DefaultButton, FocusTrapZone, PrimaryButton, Spinner } from '@fluentui/react';

const popupStyles = mergeStyleSets({
    root: {
        background: 'rgba(0, 0, 0, 0.2)',
        bottom: '0',
        left: '0',
        position: 'fixed',
        right: '0',
        top: '0',
    },
    content: {
        background: 'white',
        left: '50%',
        maxWidth: '400px',
        padding: '1em 2em 2em',
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    },
});

interface DeleteConfirmationState {
    isLoading: boolean
}

interface DeleteConfirmationProps {
    deleteItemTitle: string,
    onConfirm: () => void,
    onDismiss: () => void
}

export class DeleteConfirmationOverlay extends React.Component<DeleteConfirmationProps, DeleteConfirmationState> {
    constructor(props: DeleteConfirmationProps) {
        super(props);

        this.state = {
            isLoading: false
        }
    }

    render(): JSX.Element {
        return <>
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={this.props.onDismiss}
                    enableAriaHiddenSiblings={true}
                >
                    <Overlay onClick={this.props.onDismiss} />
                    <FocusTrapZone style={{ position: 'unset' }}>
                        <div role="document" className={popupStyles.content}>
                            {this.state.isLoading && <Spinner className="spinner-modal" />}
                            <p>Are you sure you want to delete {this.props.deleteItemTitle}?</p>
                            <Stack horizontal tokens={{ childrenGap: 20 }}>
                                <PrimaryButton 
                                    onClick={() => {
                                        this.setState({ isLoading: true });
                                        this.props.onConfirm();
                                    }}
                                >
                                    Yes
                                </PrimaryButton>
                                <DefaultButton onClick={this.props.onDismiss}>No</DefaultButton>
                            </Stack>
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        </>
    };
}