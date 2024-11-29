import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { Stack } from "@fluentui/react";
import { Button } from "@fluentui/react-components";
import {
    ChevronDoubleLeft16Regular,
    ChevronDoubleRight16Regular,
    ChevronLeft16Regular,
    ChevronRight16Regular
} from "@fluentui/react-icons";

export type TPaginationProps = {
    pageNumber: number
    setPageNumber: Dispatch<SetStateAction<number>>
} & ({ pageMax: number } | { hasNextPage: boolean })

export const Pagination = ({ pageNumber, setPageNumber, ...props }: TPaginationProps) => (
    ("pageMax" in props ? props.pageMax < 2 : (!props.hasNextPage && pageNumber < 2)) ? <></> : (
        <Stack horizontal tokens={{childrenGap: ".5rem"}}>
            <Stack.Item>
                <Button appearance="transparent" onClick={() => setPageNumber(1)} disabled={pageNumber === 1} icon={<ChevronDoubleLeft16Regular />}/>
                <Button appearance="transparent" onClick={() => setPageNumber(prev => prev - 1)} disabled={pageNumber === 1} icon={<ChevronLeft16Regular />}/>
            </Stack.Item>

            {"pageMax" in props && Array.from({length: props.pageMax}, (_, i) => i + 1).map(e => (
                <Button
                    key={e}
                    appearance="transparent"
                    onClick={() => setPageNumber(e)}
                    size="small"
                    icon={pageNumber === e ? <b>{e}</b> : <>{e}</>}
                    className={"pagination-page-button"}
                />
            ))}

            <Stack.Item>
                <Button
                    appearance="transparent"
                    onClick={() => setPageNumber(prev => prev + 1)}
                    disabled={"pageMax" in props ? pageNumber === props.pageMax : !props.hasNextPage}
                    icon={<ChevronRight16Regular/>}
                />
                {"pageMax" in props && (
                    <Button appearance="transparent" onClick={() => setPageNumber(props.pageMax)} disabled={pageNumber === props.pageMax} icon={<ChevronDoubleRight16Regular />}/>
                )}
            </Stack.Item>
        </Stack>
    )
)
