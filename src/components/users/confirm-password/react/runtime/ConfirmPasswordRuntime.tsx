import * as React from "react";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import { Logger } from "@paperbits/common/logging";
import { FluentProvider } from "@fluentui/react-components";
import { UsersService } from "../../../../../services/usersService";
import { validateBasic } from "../../../../utils/react/validateBasic";
import { ValidationMessages } from "../../../validationMessages";
import { ErrorSources } from "../../../validation-summary/constants";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { fuiTheme } from "../../../../../constants";
import { ConfirmPasswordForm, TSubmit } from "./ConfirmPasswordForm";

interface ConfirmPasswordRuntimeState {
    userId: string;
    token: string;
}

export class ConfirmPasswordRuntime extends React.Component<{}, ConfirmPasswordRuntimeState> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("logger")
    public logger: Logger;

    constructor(props) {
        super(props);

        this.state = {
            userId: null,
            token: null
        }
    }

    async componentDidMount() {
        const userId = await this.usersService.getCurrentUserId();

        if (userId) {
            this.usersService.navigateToHome();
            return;
        }

        this.getDataFromParams();
    }

    getDataFromParams = async () => {
        const queryParams = new URLSearchParams(location.search);

        if (!queryParams.has("userid") || !queryParams.has("ticketid") || !queryParams.has("ticket")) {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, ["Required params not found"]);
            return;
        }

        let token = null;
        let userId = null;

        try {
            token = this.usersService.getTokenFromTicketParams(queryParams);
            userId = this.usersService.getUserIdFromParams(queryParams);

            if (!userId) {
                throw new Error("User not found.");
            }
        } catch (error) {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, ["Activate user error: " + error.message]);
        }

        this.setState({ userId, token });
    }

    submit: TSubmit = async (password, passwordConfirmation) => {
        if (!this.state.token || !this.state.userId) {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, ["Required params not found"]);
            return;
        }

        const validationGroup = {
            password: { required: ValidationMessages.passwordRequired, eval: (val) => val.length < 8 && "Password is too short." }, // TODO: password requirements should come from Management API.
            passwordConfirmation: { eval: (val) => val !== password && ValidationMessages.passwordConfirmationMustMatch },
        }

        const values = { password, passwordConfirmation };
        const clientErrors = validateBasic(values, validationGroup);

        if (clientErrors.length > 0) {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, clientErrors);
            return false;
        }

        try {
            dispatchErrors(this.eventManager, ErrorSources.confirmpassword, []);
            await this.usersService.updatePassword(this.state.userId, password, this.state.token);

            return true;
        } catch (error) {
            parseAndDispatchError(this.eventManager, ErrorSources.confirmpassword, error, this.logger, undefined, detail => `${detail.target}: ${detail.message} \n`);
            return false;
        }
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ConfirmPasswordForm submit={this.submit.bind(this)} />
            </FluentProvider>
        );
    }
}
