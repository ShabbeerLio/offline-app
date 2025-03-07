import React, { useState } from "react";
import { useFileContext } from "../../FileContext";
import { Link } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker"; // Fix the worker issue
import "./Storage.css";
import { IoIosHome } from "react-icons/io";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Storage = () => {
  const { files, setFiles } = useFileContext();
  const [selectedType, setSelectedType] = useState("");

  // Handle file uploads
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    const filePreviews = await Promise.all(
      selectedFiles.map(async (file) => {
        let url = URL.createObjectURL(file);

        if (file.type === "application/pdf") {
          url = await generatePDFPreview(file);
        }

        return {
          name: file.name,
          url,
          type: file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
              ? "video"
              : file.type === "application/pdf"
                ? "pdf"
                : "other",
          fileUrl: URL.createObjectURL(file), // For full PDF view
        };
      })
    );

    setFiles((prevFiles) => [...prevFiles, ...filePreviews]);
  };

  // Generate PDF preview
  const generatePDFPreview = async (file) => {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    const page = await pdf.getPage(1);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;

    return canvas.toDataURL("image/png");
  };

  // Handle file deletion
  const handleDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="Storage">
      <div className="storage-head">
        <h3>Storage</h3>
        <Link to="/home"><IoIosHome/></Link>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Select File Type</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
        </select>

        <input
          type="file"
          accept={
            selectedType === "image"
              ? "image/*"
              : selectedType === "video"
                ? "video/*"
                : selectedType === "pdf"
                  ? "application/pdf"
                  : "*"
          }
          multiple
          onChange={handleFileUpload}
          disabled={!selectedType}
        />
      </div>

      {/* Display Uploaded Files */}
      <div className="file-list">
        {files.length === 0 ? (
          <p>No files uploaded</p>
        ) : (
          files.map((file, index) => (
            <div key={index} className="file-item">
              {file.type === "image" && <img src={file.url} alt={file.name} />}
              {file.type === "video" && (
                <video controls>
                  <source src={file.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {file.type === "pdf" && <img src={file.url} alt="PDF Preview" />}
              <p>{file.name}</p>
              <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Storage;