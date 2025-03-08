import React from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker";
import { useFileContext } from "../../FileContext";
import { Link } from "react-router-dom";
import "./Upload.css";
import logo from "../../Assets/logo.png"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Upload = () => {
    const { setFiles } = useFileContext();

    const handleFolderSelect = async (event) => {
        const selectedFiles = Array.from(event.target.files);

        const filePreviews = await Promise.all(
            selectedFiles.map(async (file) => {
                let url = await getFileURL(file);

                return {
                    name: file.name,
                    url,
                    type: getFileType(file.type),
                };
            })
        );

        setFiles(filePreviews);
    };

    const getFileURL = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            if (file.type.startsWith("image/")) {
                reader.readAsDataURL(file);
            } else if (file.type === "application/pdf") {
                generatePDFPreview(file).then(resolve);
            } else {
                resolve(URL.createObjectURL(file)); // For videos
            }
        });
    };

    const generatePDFPreview = async (file) => {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        const page = await pdf.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        return canvas.toDataURL("image/png"); // Convert to Base64
    };

    const getFileType = (mimeType) => {
        if (mimeType.startsWith("image/")) return "image";
        if (mimeType.startsWith("video/")) return "video";
        if (mimeType === "application/pdf") return "pdf";
        return "other";
    };

    return (
        <div className="Upload">
            <div className="Upload-main">
                <div className="Upload-box">
                    <div className="upload-logo">
                        <h5>Welcome</h5>
                        <img src={logo} alt="" />
                    </div>
                    <label htmlFor="file">Choose File</label>
                    <input
                        type="file"
                        webkitdirectory="true"
                        multiple
                        accept="image/*,video/*,application/pdf"
                        onChange={handleFolderSelect}
                        className="mb-4"
                    />
                    <div className="upload-links">
                        <Link to={"/home"}>Play</Link>
                        <Link to={"/storage"}>Storage</Link>
                    </div>
                </div>
            </div>
            <div className="upload-footer">
                <p>Dev. by :- <Link to={"https://digitaldezire.com/"}>Digital Dezire</Link></p>
            </div>
        </div>
    );
};

export default Upload;