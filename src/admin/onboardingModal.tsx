import * as React from 'react';
import Carousel, { ControlProps } from 'nuka-carousel';
import { DefaultButton, IconButton, Image, ImageFit, Link, Modal, PrimaryButton, Stack, Text } from '@fluentui/react';

interface OnboardingModalState {
    currentSlide: number
}

interface OnboardingModalProps {
    onDismiss: () => void
}

export class OnboardingModal extends React.Component<OnboardingModalProps, OnboardingModalState> {
    constructor(props: OnboardingModalProps) {
        super(props);

        this.state = {
            currentSlide: 0
        }
    }

    renderPrevButton = (props: ControlProps): JSX.Element => (
        <DefaultButton
            text="Previous"
            onClick={() => props.previousSlide()}
            styles={{ root: { display: props.previousDisabled ? 'none' : 'block' } }}
        />
    )
    
    renderNextButton = (props: ControlProps): JSX.Element => (
        <PrimaryButton
            text={props.currentSlide === 3 ? 'Close' : 'Next' }
            onClick={() => props.currentSlide === 3 ? this.props.onDismiss() : props.nextSlide()}
        />
    )

    render(): JSX.Element {
        return <>
            <Modal
                isOpen={true}
                containerClassName="admin-modal onboarding-modal"
            >
                <>
                    <IconButton
                        iconProps={{ iconName: 'Cancel', styles: { root: { color: '#ffffff' } } }}
                        aria-label="Close"
                        className="onboarding-modal-close"
                        onClick={this.props.onDismiss}
                    />
                    <Carousel
                        slideIndex={this.state.currentSlide}
                        enableKeyboardControls
                        defaultControlsConfig={{ pagingDotsClassName: 'carousel-dot', pagingDotsContainerClassName: 'carousel-dots-container' }}
                        renderCenterLeftControls={(props: ControlProps) => this.renderPrevButton(props)}
                        renderCenterRightControls={(props: ControlProps) => this.renderNextButton(props)}
                    >
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">✨ Introducing new, improved developer portal editor and API and product details widgets!</Text>
                                <Text block>We redesigned the portal editor interface to boost your productivity and enhance the interactions with your favorite features and tools. 
                                The new API and product details widgets elevate the experience of developer portal for visitors and enable you to publish supplemental documentation.</Text>
                                <Text block>What's new:</Text>
                                <ul>
                                    <li><Text>Improved developer portal editor.</Text></li>
                                    <li><Text>Redesigned API and product details widgets with the support for custom Markdown documentation.</Text></li>
                                </ul>
                            </Stack>
                        </div>
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">Get a fresh look at the new editor experience</Text>
                                <Text block>We re-organized the new portal editor layout around three core elements, making site management a breeze. Rest assured, all your favorite features remain intact - we have not added or removed any functionality.</Text>
                                <ul>
                                    <li><Text>Left side menu: Easily locate all the features you need to manage and customize your site.</Text></li>
                                    <li><Text>Top toolbar menu: Quickly save and publish changes or switch between editing options.</Text></li>
                                    <li><Text>Content area: Effortlessly edit the content of your pages in a focused, uncluttered view.</Text></li>
                                </ul>
                            </Stack>
                        </div>
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">Elevate API and product documentation</Text>
                                <Text block>We redesigned the API and product details widgets, placing essential information right at your developers' fingertips. The new widgets combine functionality that was previously implemented with several standalone widgets for easier management and maintainability. 
                                They feature a user-friendly left navigation panel with a dedicated area for custom documentation, which you can author using Markdown in the Azure portal.</Text>
                                <Text block><Link underline target="_blank" href="https://aka.ms/apimdocs/portal/markdown">Learn more about creating custom documentation.</Link></Text>
                            </Stack>
                        </div>
                        <div>
                            <Image
                                src="/assets/images/nature.jpg"
                                imageFit={ImageFit.centerCover}
                                styles={{ root: { height: 360 } }}
                            />
                            <Stack className="carousel-text-container">
                                <Text block className="carousel-header">Explore resources and get help</Text>
                                <Text block>Whether you require assistance, seek comprehensive guidance, or want to share feedback, we've got you covered.</Text>
                                <ul>
                                    <li><Text block>Documentation: Access our library of <Link underline target="_blank" href="https://aka.ms/apimdocs/portal">documentation</Link> to gain an understanding of developer portal features and functionality.</Text></li>
                                    <li><Text block>Give feedback: Provide feedback or report a bug in our <Link underline target="_blank" href="https://aka.ms/apimdevportal">GitHub repository</Link>.</Text></li>
                                    <li><Text block>Support: Contact support via the Azure portal interface of your API Management service.</Text></li>
                                </ul>
                            </Stack>
                        </div>
                    </Carousel>
                </>
            </Modal>
        </>
    }
}