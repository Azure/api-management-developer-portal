import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import {
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    TableCell,
    TableRow,
} from "@fluentui/react-components";
import {
    DeleteRegular,
    EditRegular,
    MoreHorizontalRegular,
    SettingsRegular,
} from "@fluentui/react-icons";
import { InfoTable } from "@microsoft/api-docs-ui";
import { User } from "../../../../../models/user";
import { formatDate } from "../../../../utils";
import { BtnSpinner } from "../../../../utils/react/BtnSpinner";
import { ValueOrField } from "../../../../utils/react/ValueOrField";

export const ProfileTable = ({ user, save, changePassword, deleteAccount, delegationEdit }: {
    user: User
    save: (firstName: string, surname: string) => Promise<unknown>
    changePassword: () => Promise<unknown>
    deleteAccount: () => Promise<unknown>
    delegationEdit: () => Promise<boolean>
}) => {
    const [isEdit, setIsEdit] = useState(false);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);

    const onEdit = async () => {
        const isDelegationEnabled = await delegationEdit();
        if (isDelegationEnabled) return;

        setIsEdit(true);
    }

    return (
        <InfoTable
            title="User profile"
            columnLabels={["Email", "First name", "Last name", "Date created", ""]}
            children={
                <TableRow>
                    <TableCell className="text-truncate">{user.email}</TableCell>
                    <TableCell className="text-truncate">
                        <ValueOrField
                            enableSave={false}
                            isEdit={isEdit}
                            value={firstName}
                            setValue={setFirstName}
                            inputProps={{ placeholder: "First name", style: { margin: 0 } }}
                        >
                            {user.firstName}
                        </ValueOrField>
                    </TableCell>
                    <TableCell className="text-truncate">
                        <ValueOrField
                            enableSave={false}
                            isEdit={isEdit}
                            value={lastName}
                            setValue={setLastName}
                            inputProps={{ placeholder: "Last name", style: { margin: 0 } }}
                        >
                            {user.lastName}
                        </ValueOrField>
                    </TableCell>
                    <TableCell>
                        {formatDate(user.registrationDate)}
                    </TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                        {isEdit ? (
                            <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }}>
                                <BtnSpinner
                                    className="button button-primary button-profile"
                                    onClick={() => save(firstName, lastName).then(() => setIsEdit(false))}
                                >
                                    Save
                                </BtnSpinner>
                                <button className="button button-profile" onClick={() => setIsEdit(false)}>
                                    Cancel
                                </button>
                            </Stack>
                        ) : (
                            <Menu>
                                <MenuTrigger disableButtonEnhancement>
                                    <Button
                                        appearance="transparent"
                                        icon={<MoreHorizontalRegular />}
                                    />
                                </MenuTrigger>

                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            onClick={onEdit}
                                            icon={<EditRegular />}
                                        >
                                            Edit
                                        </MenuItem>
                                        <MenuItem
                                            onClick={changePassword}
                                            icon={<SettingsRegular />}
                                        >
                                            Change password
                                        </MenuItem>
                                        <MenuItem
                                            onClick={deleteAccount}
                                            icon={<DeleteRegular style={{ color: "red" }} />}
                                            style={{ color: "red" }}
                                        >
                                            Delete account
                                        </MenuItem>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                        )}
                    </TableCell>
                </TableRow>
            }
        />
    );
};
