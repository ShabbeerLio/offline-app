import { useState, useEffect, useRef } from "react";
import "./Home.css";
import { useFileContext } from "../../FileContext";
import { FaAnglesUp } from "react-icons/fa6";
import { MdStorage } from "react-icons/md";
import { Link } from "react-router-dom";


export default function Home() {
  const { files } = useFileContext();
  const [filess, setFiles] = useState([]); // Initialize as empty
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileIndex, setFileIndex] = useState(0);
  const videoRef = useRef(null);
  const [openscroll, setOpenscroll] = useState(false);

  // Toggle scroll button
  const handleClickend = () => {
    setOpenscroll((prev) => !prev);
  };

  // Ensure files have valid Object URLs
  useEffect(() => {
    if (files.length > 0) {
      const updatedFiles = files.map((file) => ({
        ...file,
        url: file.url || URL.createObjectURL(file), // Ensure valid URL
      }));

      setFiles(updatedFiles);
      setSelectedFile(updatedFiles[0] || null);
    }
  }, [files]); // Run only when `files` from context changes

  // Automatically switch files
  useEffect(() => {
    if (filess.length === 0) return;
    let timeout;

    const switchToNextFile = () => {
      const nextIndex = (fileIndex + 1) % filess.length; // Loop back to start
      setFileIndex(nextIndex);
      setSelectedFile(filess[nextIndex]);
    };

    if (selectedFile?.type === "video") {
      // Switch after video ends
      const handleVideoEnd = () => {
        switchToNextFile();
      };

      if (videoRef.current) {
        videoRef.current.addEventListener("ended", handleVideoEnd);
      }

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("ended", handleVideoEnd);
        }
      };
    } else {
      // Switch after 5 seconds for images/PDFs
      timeout = setTimeout(() => {
        switchToNextFile();
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [fileIndex, selectedFile, filess]);

  // Cleanup Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      filess.forEach((file) => {
        if (file.url) URL.revokeObjectURL(file.url);
      });
    };
  }, [filess]);

  return (
    <div className="ViewPage">
      <div className="ViewPage-main">
        <div className="ViewPage-box">
          <div className="view-link">
            <Link to={"/storage"}>
              <MdStorage />
            </Link>
          </div>

          {/* Main Display */}
          <div className="ViewPage-box-view">
            {selectedFile ? (
              selectedFile.type === "video" ? (
                <video
                  ref={videoRef}
                  src={selectedFile.url}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : selectedFile.type === "image" ? (
                <img
                  src={selectedFile.url}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              ) : selectedFile.type === "pdf" ? (
                <a
                  href={selectedFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={selectedFile.url}
                    alt="PDF Preview"
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <p className="text-center text-gray-500">
                  Unsupported file type
                </p>
              )
            ) : (
              <p className="text-center text-gray-500">No file selected</p>
            )}
          </div>

          {/* Slider for Previews */}
          <div
            className={`ViewPage-box-slider-main ${
              openscroll === true ? "active" : ""
            }`}
          >
            <div className="slider-button">
              <p onClick={handleClickend}>
                <FaAnglesUp />
              </p>
            </div>
            <div className="ViewPage-box-slider">
              {filess.map((file, index) => (
                <div
                  className={`slider-box ${
                    index === fileIndex ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    setFileIndex(index);
                    setSelectedFile(file);
                  }}
                >
                  {file.type === "image" ? (
                    <img src={file.url} alt={file.name} />
                  ) : file.type === "video" ? (
                    <video src={file.url} className="w-full h-full object-cover"></video>
                  ) : file.type === "pdf" ? (
                    <img src={file.url} alt="PDF Preview" />
                  ) : (
                    <p>Unsupported</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}