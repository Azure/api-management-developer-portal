import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import SidePanel from "./components/SidePanel";

export const AdminPanel = () => (
    <SidePanel />
)

const domContainer = document.querySelector('#admin-panel');
const root = createRoot(domContainer);
root.render(<AdminPanel />);
