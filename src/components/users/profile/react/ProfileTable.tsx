import * as React from "react";
import { useState } from "react";
import * as moment from "moment";
import {
    Body1Strong,
    Button,
    Input,
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
    MoreVerticalRegular,
    SettingsRegular,
} from "@fluentui/react-icons";
import { User } from "../../../../models/user";
import { Stack } from "@fluentui/react";
import { BtnSpinner } from "../../../BtnSpinner";

type TValueOrFieldProps<T> = {
    isEdit: boolean;
    value?: T;
    setValue: (value: T) => void;
    placeholder?: string;
};

const ValueOrField = ({
    isEdit,
    value,
    setValue,
    placeholder,
    children,
}: React.PropsWithChildren<TValueOrFieldProps<string>>) => {
    if (!isEdit) return <>{children ?? value}</>;

    return (
        <Input
            value={value}
            onChange={(_, data) => setValue(data.value)}
            placeholder={placeholder}
        />
    );
};

export const ProfileTable = ({ user, save, changePassword, deleteAccount }: {
    user: User
    save: (firstName: string, surname: string) => Promise<unknown>
    changePassword: (newPassword: string) => Promise<unknown>
    deleteAccount: () => Promise<unknown>
}) => {
    const [isEdit, setIsEdit] = useState(false);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);

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

                    <TableHeaderCell>
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
                            placeholder={"First name"}
                        >
                            {user.firstName}
                        </ValueOrField>
                    </TableCell>
                    <TableCell>
                        <ValueOrField
                            isEdit={isEdit}
                            value={lastName}
                            setValue={setLastName}
                            placeholder={"Last name"}
                        >
                            {user.lastName}
                        </ValueOrField>
                    </TableCell>
                    <TableCell>
                        {user.registrationDate
                            ? moment(user.registrationDate).format("MM/DD/YYYY")
                            : ""}
                    </TableCell>
                    <TableCell style={{ textAlign: "right" }}>
                        {isEdit ? (
                            <Stack tokens={{ childrenGap: 20 }}>
                                <BtnSpinner
                                    size="small"
                                    appearance="primary"
                                    onClick={() => save(firstName, lastName)}
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
                                        icon={<MoreVerticalRegular />}
                                    />
                                </MenuTrigger>

                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            onClick={() => setIsEdit(true)}
                                            icon={<EditRegular />}
                                        >
                                            Edit
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => alert("TODO")}
                                            icon={<SettingsRegular />}
                                        >
                                            Change password
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => confirm("Are you sure you want to delete your account?") && deleteAccount()}
                                            icon={
                                                <DeleteRegular
                                                    style={{ color: "red" }}
                                                />
                                            }
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
