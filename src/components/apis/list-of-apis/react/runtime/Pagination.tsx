import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@fluentui/react-components";
import { ChevronDoubleLeft20Regular, ChevronLeft20Regular, ChevronRight20Regular } from "@fluentui/react-icons";

export type PaginationProps = {
    pageNumber: number,
    setPageNumber: Dispatch<SetStateAction<number>>,
    pageMax: number
}

export const Pagination = ({pageNumber, setPageNumber, pageMax}: PaginationProps) => (
    <>
        <Button appearance="transparent" onClick={() => setPageNumber(1)} disabled={pageNumber === 1} icon={<ChevronDoubleLeft20Regular />}/>
        <Button appearance="transparent" onClick={() => setPageNumber(prev => prev - 1)} disabled={pageNumber === 1} icon={<ChevronLeft20Regular />}/>
        <div style={{display: "inline-block", padding: "0 2rem"}}>
            {Array.from({length: pageMax}, (_, i) => i + 1).map(e => (
                <Button key={e} appearance="transparent" onClick={() => setPageNumber(e)} size="small" icon={
                    pageNumber === e ? <b>{e}</b> : <>{e}</>
                }/>
            ))}
        </div>
        <Button appearance="transparent" onClick={() => setPageNumber(prev => prev + 1)} disabled={pageNumber === pageMax} icon={<ChevronRight20Regular />}/>
        <Button appearance="transparent" onClick={() => setPageNumber(pageMax)} disabled={pageNumber === pageMax} icon={<ChevronRight20Regular />}/>
    </>
)
