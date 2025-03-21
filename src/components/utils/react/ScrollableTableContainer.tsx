import * as React from "react";

interface Props {
    className?: string;
    children: React.ReactNode;
}

export const ScrollableTableContainer = ({ className, children }: Props) => (
    <div className={`scrollable-table-container ${className}`}>{children}</div>
);
