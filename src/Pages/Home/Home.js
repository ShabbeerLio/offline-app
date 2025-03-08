import React, { useEffect, useState, useRef } from "react";
import { useFileContext } from "../../FileContext";
import { Link } from "react-router-dom";
import "./Home.css";
import { FaAnglesUp,FaPlay } from "react-icons/fa6";
import { MdStorage } from "react-icons/md";


const Home = () => {
  const { files } = useFileContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const [openscroll, setOpenscroll] = useState(false);

  // Toggle scroll button
  const handleClickend = () => {
    setOpenscroll((prev) => !prev);
  };

  useEffect(() => {
    if (files.length === 0) return;

    clearTimeout(timeoutRef.current);

    const playNextFile = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
    };

    if (files[currentIndex].type === "video") {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.pause(); // Stop current video before switching
        videoElement.currentTime = 0; // Reset playback
        videoElement.play().catch((e) => console.warn("Autoplay failed:", e));

        videoElement.onended = () => {
          playNextFile();
        };
      }
    } else {
      timeoutRef.current = setTimeout(playNextFile, 5000);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, files]);

  const handleFileClick = (index) => {
    setCurrentIndex(index);
    clearTimeout(timeoutRef.current);
    setOpenscroll(false)
  };

  if (files.length === 0) {
    return <h1>No files to display</h1>;
  }

  return (
    <div className="ViewPage">
      <div className="ViewPage-main">
        <div className="ViewPage-box">
          <div className="view-link">
            <Link to={"/storage"}>
              <MdStorage />
            </Link>
            <div className="slider-button">
              <p onClick={handleClickend}>
                <FaAnglesUp />
              </p>
            </div>
          </div>

          {/* Main File Preview */}
          <div className="ViewPage-box-view">
            {files[currentIndex].type === "image" && (
              <img src={files[currentIndex].url} alt={files[currentIndex].name} />
            )}

            {files[currentIndex].type === "video" && (
              <video
                ref={videoRef}
                controls
                autoPlay
                key={files[currentIndex].url} // Ensures reloading when file changes
              >
                <source src={files[currentIndex].url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {files[currentIndex].type === "pdf" && (
              <img src={files[currentIndex].url} alt="PDF Preview" />
            )}
          </div>

          {/* Slider for Previews */}
          <div
            className={`ViewPage-box-slider-main ${openscroll === true ? "active" : ""
              }`}
          >

            <div className="ViewPage-box-slider">
              {files.map((file, index) => (
                <div key={index} className="slider-box" onClick={() => handleFileClick(index)}>
                  {file.type === "image" && <img src={file.url} alt={file.name} />}
                  {file.type === "pdf" && <img src={file.url} alt="PDF Preview" />}
                  {file.type === "video" && (
                    <video muted>
                      <source src={file.url} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;