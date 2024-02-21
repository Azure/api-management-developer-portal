import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@fluentui/react-components";

export const Pagination = ({pageNumber, setPageNumber, pageMax}: {pageNumber: number, setPageNumber: Dispatch<SetStateAction<number>>, pageMax: number}) => (
    <>
        <Button onClick={() => setPageNumber(1)} disabled={pageNumber === 1} appearance="transparent" icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.3534 15.8527C11.1585 16.0484 10.8419 16.0489 10.6463 15.854L5.16178 10.389C4.94607 10.1741 4.94607 9.82477 5.16178 9.60982L10.6463 4.14484C10.8419 3.94993 11.1585 3.95049 11.3534 4.1461C11.5483 4.34171 11.5477 4.65829 11.3521 4.85321L6.18753 9.99942L11.3521 15.1456C11.5477 15.3406 11.5483 15.6571 11.3534 15.8527ZM15.3524 15.8527C15.1575 16.0484 14.8409 16.0489 14.6453 15.854L9.16081 10.389C8.94509 10.1741 8.9451 9.82477 9.16081 9.60982L14.6453 4.14484C14.8409 3.94993 15.1575 3.95049 15.3524 4.1461C15.5473 4.34171 15.5467 4.65829 15.3511 4.85321L10.1866 9.99942L15.3511 15.1456C15.5467 15.3406 15.5473 15.6571 15.3524 15.8527Z" fill="currentColor"/>
            </svg>
        }/>
        <Button onClick={() => setPageNumber(prev => prev - 1)} disabled={pageNumber === 1} appearance="transparent" icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.3534 15.8527C12.1585 16.0484 11.8419 16.0489 11.6463 15.854L6.16178 10.389C5.94607 10.1741 5.94607 9.82477 6.16178 9.60982L11.6463 4.14484C11.8419 3.94993 12.1585 3.95049 12.3534 4.1461C12.5483 4.34171 12.5477 4.65829 12.3521 4.85321L7.18753 9.99942L12.3521 15.1456C12.5477 15.3406 12.5483 15.6571 12.3534 15.8527Z" fill="currentColor"/>
            </svg>
        }/>
        <div style={{display: "inline-block", padding: "0 2rem"}}>
            {Array.from({length: pageMax}, (_, i) => i + 1).map(e => (
                <Button key={e} onClick={() => setPageNumber(e)} size="small" appearance="transparent" icon={
                    pageNumber === e ? <b>{e}</b> : <>{e}</>
                }/>
            ))}
        </div>
        <Button onClick={() => setPageNumber(prev => prev + 1)} disabled={pageNumber === pageMax} appearance="transparent" icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="currentColor"/>
            </svg>
        }/>
        <Button onClick={() => setPageNumber(pageMax)} disabled={pageNumber === pageMax} appearance="transparent" icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.64582 4.14708C8.84073 3.95147 9.15731 3.9509 9.35292 4.14582L14.8374 9.6108C15.0531 9.82574 15.0531 10.1751 14.8374 10.39L9.35292 15.855C9.15731 16.0499 8.84073 16.0493 8.64582 15.8537C8.4509 15.6581 8.45147 15.3415 8.64708 15.1466L13.8117 10.0004L8.64708 4.85418C8.45147 4.65927 8.4509 4.34269 8.64582 4.14708ZM4.64582 4.14708C4.84073 3.95147 5.15731 3.9509 5.35292 4.14582L10.8374 9.6108C11.0531 9.82574 11.0531 10.1751 10.8374 10.39L5.35292 15.855C5.15731 16.0499 4.84073 16.0493 4.64582 15.8537C4.4509 15.6581 4.45147 15.3415 4.64708 15.1466L9.81166 10.0004L4.64708 4.85418C4.45147 4.65927 4.4509 4.34269 4.64582 4.14708Z" fill="currentColor"/>
            </svg>
        }/>
    </>
)
