import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import {
    Body1Strong,
    Button,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import {
    DeleteRegular,
    EditRegular,
    MoreHorizontalRegular,
    SettingsRegular,
} from "@fluentui/react-icons";
import { User } from "../../../../models/user";
import { formatDate } from "../../../utils";
import { BtnSpinner } from "../../../utils/react/BtnSpinner";
import { ValueOrField } from "../../../utils/react/ValueOrField";

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
        <Table
            className={"fui-table"}
            size={"small"}
            aria-label={"User profile"}
        >
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <Body1Strong>Email</Body1Strong>
                    </TableHeaderCell>

                    <TableHeaderCell>
                        <Body1Strong>First name</Body1Strong>
                    </TableHeaderCell>

                    <TableHeaderCell>
                        <Body1Strong>Last name</Body1Strong>
                    </TableHeaderCell>

                    <TableHeaderCell>
                        <Body1Strong>Date created</Body1Strong>
                    </TableHeaderCell>

                    <TableHeaderCell style={{ width: "4.825em" }}>
                        <Body1Strong></Body1Strong>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableRow>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <ValueOrField
                            isEdit={isEdit}
                            value={firstName}
                            setValue={setFirstName}
                            inputProps={{ placeholder: "First name" }}
                        >
                            {user.firstName}
                        </ValueOrField>
                    </TableCell>
                    <TableCell>
                        <ValueOrField
                            isEdit={isEdit}
                            value={lastName}
                            setValue={setLastName}
                            inputProps={{ placeholder: "Last name" }}
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
                                    appearance="primary"
                                    size="small"
                                    onClick={() => save(firstName, lastName).then(() => setIsEdit(false))}
                                >
                                    Save
                                </BtnSpinner>
                                <Button
                                    size="small"
                                    onClick={() => setIsEdit(false)}
                                >
                                    Cancel
                                </Button>
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
            </TableBody>
        </Table>
    );
};
