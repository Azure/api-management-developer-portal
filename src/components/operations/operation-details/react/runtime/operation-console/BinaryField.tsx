import * as React from "react";
import { useRef, useState } from "react";
import { Body1, Button } from "@fluentui/react-components";
import { ArrowUploadRegular } from "@fluentui/react-icons";

type BinaryFieldProps = {
    updateBinary: (file: File) => void;
    fileName?: string;
}

export const BinaryField = ({ updateBinary, fileName }: BinaryFieldProps ) => {
    const [uploadedFileName, setUploadedFileName] = useState<string>(fileName ?? "");
    const hiddenFileInput = useRef<HTMLInputElement>(null);
    
    const selectFile = () => {
        hiddenFileInput.current.click();
    };

    const uploadFile = (event) => {
        const fileUploaded = event.target.files[0];
        setUploadedFileName(fileUploaded.name);
        updateBinary(fileUploaded);
    };

    return (
        <>
            <Button
                icon={<ArrowUploadRegular />}
                onClick={selectFile}
                className="request-body-upload-button"
            >
                Upload file
            </Button>
            <Body1 block>{uploadedFileName}</Body1>
            <input
                type="file"
                onChange={uploadFile}
                ref={hiddenFileInput}
                style={{ display: "none" }} // FluentUI doesn't have a file uploader, so using a hidden file input instead
            />
        </>
    );
}
