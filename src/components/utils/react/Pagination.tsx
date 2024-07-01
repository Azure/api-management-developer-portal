import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { Stack } from "@fluentui/react";
import { Button } from "@fluentui/react-components";
import {
    ChevronDoubleLeft20Regular,
    ChevronDoubleRight20Regular,
    ChevronLeft20Regular,
    ChevronRight20Regular
} from "@fluentui/react-icons";

export type PaginationProps = {
    pageNumber: number
    setPageNumber: Dispatch<SetStateAction<number>>
} & ({ pageMax: number } | { hasNextPage: boolean })

export const Pagination = ({ pageNumber, setPageNumber, ...props }: PaginationProps) => (
    ("pageMax" in props ? props.pageMax < 2 : (!props.hasNextPage && pageNumber < 2)) ? <></> : (
        <Stack horizontal tokens={{childrenGap: ".5rem"}}>
            <Stack.Item>
                <Button appearance="transparent" onClick={() => setPageNumber(1)} disabled={pageNumber === 1} icon={<ChevronDoubleLeft20Regular />}/>
                <Button appearance="transparent" onClick={() => setPageNumber(prev => prev - 1)} disabled={pageNumber === 1} icon={<ChevronLeft20Regular />}/>
            </Stack.Item>

            {"pageMax" in props && Array.from({length: props.pageMax}, (_, i) => i + 1).map(e => (
                <Button key={e} appearance="transparent" onClick={() => setPageNumber(e)} size="small" icon={
                    pageNumber === e ? <b>{e}</b> : <>{e}</>
                }/>
            ))}

            <Stack.Item>
                <Button
                    appearance="transparent"
                    onClick={() => setPageNumber(prev => prev + 1)}
                    disabled={"pageMax" in props ? pageNumber === props.pageMax : !props.hasNextPage}
                    icon={<ChevronRight20Regular/>}
                />
                {"pageMax" in props && (
                    <Button appearance="transparent" onClick={() => setPageNumber(props.pageMax)} disabled={pageNumber === props.pageMax} icon={<ChevronDoubleRight20Regular />}/>
                )}
            </Stack.Item>
        </Stack>
    )
)
