import React, { useEffect, useState, useRef } from "react";
import { useFileContext } from "../../FileContext";
import { Link } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FaAnglesUp } from "react-icons/fa6";
import { MdStorage } from "react-icons/md";
import "./Home.css";

const Home = () => {
  const { files } = useFileContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(""); // Track slide direction
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const sliderRef = useRef(null);
  const [openscroll, setOpenscroll] = useState(false);

  // Toggle slider visibility
  const handleClickend = () => {
    setOpenscroll((prev) => !prev);
  };

  // Function to change the file with a sliding effect
  const changeFile = (direction) => {
    setDirection(direction > 0 ? "slide-right" : "slide-left"); // Set slide direction
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + direction + files.length) % files.length;
      scrollToActive(newIndex);
      return newIndex;
    });
  };

  // Swipe handlers for navigating files
  const handlers = useSwipeable({
    onSwipedLeft: () => changeFile(1), // Next file
    onSwipedRight: () => changeFile(-1), // Previous file
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Auto-scroll to the active preview in the slider
  const scrollToActive = (index) => {
    if (sliderRef.current) {
      const activeElement = sliderRef.current.children[index];
      if (activeElement) {
        sliderRef.current.scrollTo({
          left: activeElement.offsetLeft - sliderRef.current.offsetWidth / 2 + activeElement.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    if (files.length === 0) return;

    clearTimeout(timeoutRef.current);

    const playNextFile = () => {
      changeFile(1);
    };

    if (files[currentIndex].type === "video") {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
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
    setDirection(index > currentIndex ? "slide-right" : "slide-left"); // Slide effect
    setCurrentIndex(index);
    clearTimeout(timeoutRef.current);
    setOpenscroll(false);
    scrollToActive(index);
  };

  if (files.length === 0) {
    return <h1>No files to display</h1>;
  }

  return (
    <div className="ViewPage">
      <div className="ViewPage-main" >
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

          {/* Main File Preview with Slide Effect */}
          <div className={`ViewPage-box-view ${direction}`} {...handlers}>
            {files[currentIndex].type === "image" && (
              <img src={files[currentIndex].url} alt={files[currentIndex].name} />
            )}

            {files[currentIndex].type === "video" && (
              <video ref={videoRef} controls autoPlay key={files[currentIndex].url}>
                <source src={files[currentIndex].url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {files[currentIndex].type === "pdf" && (
              <img src={files[currentIndex].url} alt="PDF Preview" />
            )}
          </div>

          {/* Scrollable Slider for Previews */}
          <div className={`ViewPage-box-slider-main ${openscroll ? "active" : ""}`}>
            <div className="ViewPage-box-slider" ref={sliderRef}>
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`slider-box ${currentIndex === index ? "active" : ""}`}
                  onClick={() => handleFileClick(index)}
                >
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