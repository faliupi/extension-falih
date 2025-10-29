/* eslint-disable no-undef */
import * as faceapi from "face-api.js";
import { io } from "socket.io-client";
import axios from "axios";
import {
  BE_ENDPOINT,
  BE_ENDPOINT_V2,
  EMOVALARO_MODDEL_ENDPOINT,
  LLAMAAI_API_URL,
  OPENAAI_API_URL,
} from "../constants";

const modelUrl =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

const valaroModelUrl = EMOVALARO_MODDEL_ENDPOINT;
const baseUrl = BE_ENDPOINT;
const baseUrl2 = BE_ENDPOINT_V2;

let video, canvas, ctx, canvas2;
let isBusy = false;
let lastPredictionValaro = null;
let startTimeValaro = Date.now();
let retryCount = 0;
const MAX_RETRIES = 10;
const RETRY_DELAY = 1000; // 1 second

const buttonStyle = document.createElement("style");
buttonStyle.textContent = `
  .toggle-camera-btn {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 10000;
    padding: 10px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    width: 45px;
    height: 45px;
    transition: all 0.3s ease;
    overflow: hidden;
    white-space: nowrap;
    /* Center icon */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .toggle-camera-btn:hover {
    background: #1976D2;
    width: 180px;
    justify-content: flex-start;
  }
  .toggle-camera-btn:hover::after {
    content: " Show Face Detector";
    margin-left: 5px;
  }
`;
document.head.appendChild(buttonStyle);

const showCamera = async () => {
  const toggleButton = document.createElement("button");
  toggleButton.className = "toggle-camera-btn";
  toggleButton.style.marginBottom = "10px";
  toggleButton.innerHTML = "📷";

  document.body.appendChild(toggleButton);

  await Promise.all([
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      console.log('stream')
      const div = document.createElement("div");
      div.id = "cameraDiv";
      div.style.display = "none";
      
      // Create video element
      video = document.createElement("video");
      video.id = "videoRecognition";
      
      // Create canvas elements
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d");
      canvas2 = document.createElement("canvas");
      
      // Set proper size for elements
      const videoSize = 350;
      
      // Set up the div container
      div.style.position = "fixed";
      div.style.width = "auto"; // Changed from 1px to auto to properly contain elements
      div.style.zIndex = 99;
      div.style.cursor = "move";
      
      // Position canvas elements
      canvas.style.position = canvas2.style.position = "absolute";
      canvas.style.top = canvas.style.left = canvas2.style.top = canvas2.style.left = 0;
      
      // Ensure canvas2 covers the video exactly
      canvas2.style.width = `${videoSize}px`;
      canvas2.style.height = `${videoSize}px`;
      canvas2.style.position = "absolute";
      canvas2.style.top = "0";
      canvas2.style.left = "0";
      canvas.width = canvas.height = canvas2.width = canvas2.height = videoSize;
      video.width = video.height = videoSize;
      
      // Set styles for elements
      canvas.style.visibility = "hidden"; // Keep this as in your original code
      video.style.width = `${videoSize}px`;
      video.style.height = `${videoSize}px`; // Fixed: Set explicit height to match width
      video.style.objectFit = "cover"; // Ensure video covers the container properly
      
      // Make canvas2 not interfere with dragging
      canvas2.style.pointerEvents = "none";
      
      // Setup video stream
      video.autoplay = true;
      video.srcObject = stream;
      
      // Wait for video to be ready before starting detection
      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
      });
      
      // Toggle button functionality
      toggleButton.addEventListener("click", () => {
        const isHidden = div.style.display === "none";
        div.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          toggleButton.style.width = "160px";
          toggleButton.innerHTML = "Hide Face Detector";
          
          // Start face detection when showing the camera
          startFaceDetection(video, canvas2);
        } else {
          toggleButton.style.width = "45px";
          toggleButton.innerHTML = "📷";
          
          // Stop face detection when hiding the camera
          stopFaceDetection();
        }
      });
      
      // Add elements to the document
      document.body.appendChild(div);
      div.appendChild(video);
      div.appendChild(canvas);
      div.appendChild(canvas2);
      
      // Implement drag functionality
      let moving = false;
      let offsetX = 0;
      let offsetY = 0;

      div.addEventListener("mousedown", (e) => {
        moving = true;
        offsetX = e.clientX - div.getBoundingClientRect().left;
        offsetY = e.clientY - div.getBoundingClientRect().top;
      });

      window.addEventListener("mousemove", (e) => {
        if (moving) {
          div.style.right = "auto";
          div.style.bottom = "auto";
          div.style.left = `${e.clientX - offsetX}px`;
          div.style.top = `${e.clientY - offsetY}px`;
        }
      });

      window.addEventListener("mouseup", () => {
        moving = false;
      });
    }),
    faceapi.loadTinyFaceDetectorModel(modelUrl),
    faceapi.loadFaceExpressionModel(modelUrl),
  ]);
  
  // Return the video element for use in other functions
  return { video, canvas, canvas2 };
};

// Face detection function with improved animation
let detectionActive = false;
let animationId = null;

function startFaceDetection(videoElement, canvasElement) {
  const ctx = canvasElement.getContext('2d');
  detectionActive = true;
  
  async function detectFace() {
    if (!detectionActive) {
      return; // Stop detection if disabled
    }
    
    if (videoElement.readyState === 4) {
      const detections = await faceapi.detectAllFaces(
        videoElement, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceExpressions();
      
      // Clear previous drawings
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Calculate scaling factors to match video display size with canvas
      const videoDisplayWidth = parseInt(videoElement.style.width);
      const videoDisplayHeight = parseInt(videoElement.style.height);
      const videoNaturalWidth = videoElement.videoWidth;
      const videoNaturalHeight = videoElement.videoHeight;
      
      // Check if video dimensions are available
      if (videoNaturalWidth === 0 || videoNaturalHeight === 0) {
        console.warn("Video dimensions not available yet, skipping detection");
        animationId = requestAnimationFrame(detectFace);
        return;
      }
      
      // Scale factors for coordinate transformation
      const scaleX = videoDisplayWidth / videoNaturalWidth;
      const scaleY = videoDisplayHeight / videoNaturalHeight;
      
      // Draw detections
      if (detections && detections.length > 0) {
        detections.forEach(detection => {
          // Draw face detection box with proper scaling
          const box = detection.detection.box;
          const scaledX = box.x * scaleX;
          const scaledY = box.y * scaleY;
          const scaledWidth = box.width * scaleX;
          const scaledHeight = box.height * scaleY;
          
          ctx.strokeStyle = '#0051ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
          
          // Display dominant expression
          if (detection.expressions) {
            const expressions = detection.expressions;
            let dominantExpression = Object.keys(expressions).reduce((a, b) => 
              expressions[a] > expressions[b] ? a : b
            );
            
            // Background for text
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            const textContent = `${dominantExpression}: ${Math.round(expressions[dominantExpression] * 100)}%`;
            const textWidth = ctx.measureText(textContent).width;
            ctx.fillRect(scaledX, scaledY - 20, textWidth + 8, 20);
            
            // Text itself
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(textContent, scaledX + 4, scaledY - 5);
          }
        });
      }
    }
    
    if (detectionActive) {
      animationId = requestAnimationFrame(detectFace);
    }
  }
  
  detectFace();
}

function stopFaceDetection() {
  detectionActive = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function drawOverlay(canvas, prediction) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context");
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (prediction?.face_box) {
    const { face_box, emotion, emotion_perc } = prediction;

    // Get video element to calculate scaling
    const videoElement = document.getElementById("videoRecognition");
    if (!videoElement) {
      console.warn("Video element not found for scaling calculation");
      return;
    }

    // Calculate scaling factors to match video display size with canvas
    const videoDisplayWidth = parseInt(videoElement.style.width);
    const videoDisplayHeight = parseInt(videoElement.style.height);
    const videoNaturalWidth = videoElement.videoWidth;
    const videoNaturalHeight = videoElement.videoHeight;
    
    // Check if video dimensions are available
    if (videoNaturalWidth === 0 || videoNaturalHeight === 0) {
      console.warn("Video dimensions not available yet, skipping overlay");
      return;
    }
    
    // Scale factors for coordinate transformation
    const scaleX = videoDisplayWidth / videoNaturalWidth;
    const scaleY = videoDisplayHeight / videoNaturalHeight;

    // Apply scaling to face box coordinates
    const scaledX = face_box.x * scaleX;
    const scaledY = face_box.y * scaleY;
    const scaledWidth = face_box.width * scaleX;
    const scaledHeight = face_box.height * scaleY;

    // Draw face box with scaled coordinates
    ctx.strokeStyle = getColorValaro(emotion);
    ctx.lineWidth = 2;
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

    // Draw label with scaled coordinates
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(
      scaledX,
      scaledY - 20,
      ctx.measureText(`${emotion}: ${Math.round(emotion_perc)}%`).width + 8,
      20
    );

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(
      `${emotion}: ${Math.round(emotion_perc)}%`,
      scaledX + 4,
      scaledY - 6
    );
  } else {
    console.warn("No face_box in prediction:", prediction);
  }
}

function getColorValaro(emotionLabel) {
  const emotionColors = {
    Happiness: "#22c55e",
    Surprise: "#22d3ee",
    Anger: "#ef4444",
    Disgust: "#f97316",
    Fear: "#eab308",
    Sadness: "#a855f7",
    Neutral: "#3b82f6",
  };
  return emotionColors[emotionLabel] || "#3b82f6";
}

// Initialize
const initCamera = () => {
  const existingCamera = document.getElementById("cameraDiv");
  if (existingCamera) {
    existingCamera.remove();
  }
  // showCameraValaro();
  showCamera();
};

// Cleanup function
function cleanup() {
  stopFaceDetection();
  const existingCamera = document.getElementById("cameraDiv");
  if (existingCamera) {
    existingCamera.remove();
  }
}

// Listen for page unload to cleanup
window.addEventListener('beforeunload', cleanup);
window.addEventListener('unload', cleanup);

let isToastVisible = false;

function showToast(message, duration = 5000) {
  if (!isToastVisible) {
    isToastVisible = true;

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    // Other toast styles...
    toast.style.position = "absolute";
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.minWidth = "250px";
    toast.style.backgroundColor = "#4CAF50";
    toast.style.color = "#fff";
    toast.style.textAlign = "center";
    toast.style.borderRadius = "8px";
    toast.style.padding = "10px";
    toast.style.zIndex = "9999";
    toast.style.fontSize = "18px";
    toast.style.transition = `opacity ${duration}ms linear`; // Transition over the duration
    toast.style.opacity = "1"; // Start fully visible

    document.body.appendChild(toast);

    // Start the toast disappearing after the duration
    setTimeout(() => {
      toast.style.opacity = "0";
    }, duration);

    setTimeout(() => {
      toast.parentNode.removeChild(toast);
      isToastVisible = false;
    }, duration * 2);
  }
}

let gifInProgress = false;
let gifContainer = null;
let gifImgElement = null;
let currentGifUrl = "";
let debounceTimeout = null;

function showGifAlert(
  gifUrl = "https://media.giphy.com/media/3o6Zt6MLC5bXgRvlIs/giphy.gif",
  defaultEmotion = true,
  duration = 10000
) {
  if (gifUrl === currentGifUrl) {
    return; // If the new URL is the same as the current one, do nothing.
  }
  currentGifUrl = gifUrl; // Update the current GIF URL.

  if (!gifContainer) {
    gifContainer = document.createElement("div");
    gifContainer.id = "gifAlertContainer";
    gifContainer.style.position = "fixed";
    gifContainer.style.bottom = "0";
    gifContainer.style.right = "0";
    gifContainer.style.width = "250px";
    gifContainer.style.height = "200px";
    gifContainer.style.zIndex = "9999";
    gifContainer.style.borderRadius = "30px";
    gifContainer.style.cursor = "move";

    gifImgElement = document.createElement("img");
    gifImgElement.id = "gifAlert";
    gifImgElement.style.width = "100%";
    gifImgElement.style.height = "100%";
    gifImgElement.style.objectFit = "cover";
    gifImgElement.style.borderRadius = "10px";

    gifContainer.appendChild(gifImgElement);
    document.body.appendChild(gifContainer);

    let moving = false;
    let resizing = false;
    let offsetX = 0;
    let offsetY = 0;

    gifContainer.addEventListener("mousedown", (e) => {
      if (
        e.offsetX > gifContainer.offsetWidth - 10 &&
        e.offsetY > gifContainer.offsetHeight - 10
      ) {
        resizing = true;
      } else {
        moving = true;
      }
      offsetX = e.clientX - gifContainer.getBoundingClientRect().left;
      offsetY = e.clientY - gifContainer.getBoundingClientRect().top;
      e.preventDefault();
    });

    const moveElement = (e) => {
      if (moving) {
        gifContainer.style.right = "auto";
        gifContainer.style.bottom = "auto";
        gifContainer.style.left = `${e.clientX - offsetX}px`;
        gifContainer.style.top = `${e.clientY - offsetY}px`;
      } else if (resizing) {
        gifContainer.style.width = `${
          e.clientX - gifContainer.getBoundingClientRect().left
        }px`;
        gifContainer.style.height = `${
          e.clientY - gifContainer.getBoundingClientRect().top
        }px`;
      }
    };

    window.addEventListener("mousemove", (e) => {
      requestAnimationFrame(() => moveElement(e));
    });

    window.addEventListener("mouseup", () => {
      moving = false;
      resizing = false;
    });
  }

  const tempImg = new Image();
  tempImg.src = gifUrl;
  tempImg.onload = () => {
    gifImgElement.src = gifUrl;
  };

  if (defaultEmotion) {
    return;
  }

  setTimeout(() => {
    gifContainer.style.display = "none";
    gifInProgress = false;
    gifContainer = null;
    gifImgElement = null;
    currentGifUrl = ""; // Reset the current GIF URL.
  }, duration);

  gifInProgress = true;
  gifContainer.style.display = "block";

  return gifContainer;
}

function handleEmotionChange(emotion) {
  clearTimeout(debounceTimer); // Clear the existing timer on new emotion detection
  debounceTimer = setTimeout(() => {
    changeGifBasedOnEmotion(emotion);
  }, 1000); // Set a new timer (1000ms = 1 second debounce period)
}

function changeGifBasedOnEmotion(mappedEmotion) {
  axios
    .get(`${baseUrl}/facial-interventions/emotion`, {
      params: {
        emotion: mappedEmotion,
        gender: state.agent,
      },
    })
    .then((res) => {
      const base64GifUrl = res.data.data.url;
      showGifAlert(base64GifUrl, true);
    });
}

/**
 * Inisiasi state awal yang terdiri dari:
 * 1. state = variabel yang menyimpan data state dari chrome storage
 * 2. isStartState = state utama yang menentukan apakah fitur facial recognition diaktifkan
 * 3. isStartTextInterventionState = state yang menentukan apakah fitur text intervention diaktifkan
 * 4. isStartFacialInterventionState = state yang menentukan apakah fitur gif intervention diaktifkan
 */
const init = async () => {
  const state = await chrome.storage.sync.get();
  const isStartState = state.isStart;
  console.log("state", state);
  const isStartTextInterventionState = state.isStartTextIntervention;
  await chrome.storage.sync.set({
    isStart: state.isStart ?? false,
    isStartTextIntervention: state.isStartTextIntervention ?? false,
    user: state.user || {},
    meetingCode: state.meetingCode || null,
  });
  chrome.storage.sync
    .get()
    .then((result) => {
      console.log("FER:: Chrome storage", result);
    })
    .then(() => {
      console.log("FER:: State", state);
      initSocketIo();
    });

  initSocketIo();

  if (
    isStartState ||
    isStartTextInterventionState ||
    state.isStartFacialIntervention ||
    state.isStartOpenAiIntervention ||
    state.isStartLlamaAiIntervention
  ) {
    initCamera();
  }
};

/**
 * Inisiasi socket io untuk mengirim data hasil prediksi ke backend
 * dan juga untuk mengkoneksikan state start meeting pada dashboard teacher dengan state start meeting pada extension
 */
const initSocketIo = async () => {
  const state = await chrome.storage.sync.get();
  const emoviewCode = state.meetingCode;

  // const socket = io(`https://rwu.my.id`);
  const socket = io(`http://localhost:8080`);
  socket.on("connect", () => {
    console.log("FER:: Connected to socket io", emoviewCode);
    socket.emit("join", `student-${emoviewCode}`);

    // set is socket connected to true
    chrome.storage.sync.set({
      isSocketConnected: true,
    });
  });

  socket.on("WELCOME_MESSAGE", (message) => {
    console.log(message);
  });

  socket.on("join", (confirmation) => {
    console.log("FER:: Joined room:", confirmation);
  });

  socket.onAny((eventName, ...args) => {
    console.log(`FER:: Received event: ${eventName}`, args);
  });

  socket.on("connect_error", (err) => {
    console.log("FER:: Connection error", err);

    console.log("FER:: Error description", err.description);

    console.log("err context", err.context);
  });

  socket.on("RECOGNITION_STATUS", async (status) => {
    console.log("FER:: Recognition status", status);
    if (status === "started") {
      predict(status);
      // if (state.selectedRecognitionModel === "FACE_API") {
      // } else if (state.selectedRecognitionModel === "EMOVALARO") {
      //   predictEmovalaro();
      // }
    }
  });
};

/**
 * Fungsi untuk memprediksi ekspresi wajah dari user
 *
 * @param {*} status : status dari meeting, apakah meeting sudah dimulai atau belum
 *
 */
const predict = async (status) => {
  console.log("FER:: Predict called with status:", status);

  const state = await chrome.storage.sync.get();
  // console.log('state', state.isStart);
  const stateLocal = await chrome.storage.local.get();
  const emoviewCode = state.meetingCode;

  const persistedUserState = await chrome.storage.local.get("user-storage");
  const userStorage = JSON.parse(persistedUserState["user-storage"]);
  const profile = userStorage.state.profile;
  // const getReinforcementType = profile.reinforcementType;
  const getReinforcementType = state.reinforcementType;
  const getMeetingName = state.meetingName;
  const getMeetingSubject = state.meetingSubject;
  const getFirstName = profile.fullname.split(" ")[0];
  const accessToken = userStorage.state.accessToken;
  /**
   * Jika state isStart ATAU isStartTextIntervention ATAU isStartFacialIntervention
   * maka akan melakukan prediksi ekspresi wajah dari user
   */
  if (
    state.isStart ||
    state.isStartTextIntervention ||
    state.isStartOpenAiIntervention ||
    state.isStartLlamaAiIntervention ||
    state.isStartFacialIntervention
  ) {
    isBusy = true;
    const faceApiResult = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    console.log("FER:: Face API Result", faceApiResult);
    if (!faceApiResult.length) {
      console.log("FER:: Face not detected");
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      faceapi.matchDimensions(canvas2, video);
      const resizedResults = faceapi.resizeResults(faceApiResult, video);
      const minConfidence = 0.05;
      faceapi.draw.drawDetections(canvas2, resizedResults);
      faceapi.draw.drawFaceExpressions(canvas2, resizedResults, minConfidence);
      const headers = {
        headers: {
          Authorization: `Bearer ${state.user.token}`,
        },
      };
      let body;
      const beURL = `${BE_ENDPOINT}/recognition`;
      const meetingCode = state.meetingCode;
      // const beURL = `${BE_ENDPOINT_V2}/recognition/create`;
      body = {
        ...parseProbability(faceApiResult[0].expressions),
        predict: getExpression(faceApiResult[0].expressions),
        // emoviewCode: emoviewCode,
        // meetCode: meetCode,
        meetingCode: meetingCode,
        // image: canvas.toDataURL("image/jpeg"),
        // status: status,
      };

      let emotionOnly = {};
      let lastEmotion = null;
      let emotionTimeout = null;

      /**
       * TEXT INTERVENTION STATE
       * ini akan menampilkan alert intervention berdasarkan emosi yang dideteksi
       *
       * model yang digunakan adalah face-api atau emovalaro(Emodu Valence Arousal)
       */
      if (state.isStartTextIntervention) {
        emotionOnly = parseProbability(faceApiResult[0].expressions);
        // const getArcsResult = state.arcsData.result;
        const negativeEmotions = ["angry", "disgusted", "fearful", "sad"];
        const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        const threshold = 0.5;

        if (state.selectedRecognitionModel === "EMOVALARO") {
          axios
            .post(
              valaroModelUrl,
              {
                image: canvas.toDataURL("image/jpeg").split(",")[1],
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            .then(({ data }) => {
              const { emotion } = data;
              console.log("valaro emotion", emotion);
              const valaroNegativeEmotion = [
                "Anger",
                "Disgust",
                "Fear",
                "Sadness",
              ];
              // HANDLE TEXT INTERVENTION BASED ON EMOVALARO MODEL
              for (const negativeEmotion of valaroNegativeEmotion) {
                if (emotion === negativeEmotion) {
                  const emotionName = capitalise(negativeEmotion);
                  if (emotionName === lastEmotion && emotionTimeout) {
                    continue;
                  }

                  let mappedEmotion = emotionName.toLowerCase();
                  if (mappedEmotion === "sadness") {
                    mappedEmotion = "sad";
                  } else if (mappedEmotion === "fearful") {
                    mappedEmotion = "fear";
                  } else if (mappedEmotion === "anger") {
                    mappedEmotion = "angry";
                  }
                  axios
                    .get(`${baseUrl2}/affective-intervention-text/random`, {
                      params: {
                        emotion: mappedEmotion,
                        // category: getArcsResult,
                        category: getReinforcementType.toLowerCase(),
                        name: getFirstName,
                        emotionValue: data.emotion_perc,
                        meetingCode: state.meetingCode,
                      },
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    })
                    .then((res) => {
                      console.log("res intervention", res);
                      const interventionWords = res.data.text;
                      const duration =
                        interventionWords.length > 80 ? 10000 : 5000;

                      showToast(interventionWords, duration);

                      lastEmotion = emotionName;
                      if (emotionTimeout) {
                        clearTimeout(emotionTimeout);
                      }
                      emotionTimeout = setTimeout(() => {
                        lastEmotion = null;
                      }, 30000);
                    });
                }
              }

              const valaroBodyPayload = {
                arousal: data.arousal,
                valence: data.valence,
                emotion: data.emotion,
                emotionPercentages: data.emotion_perc,
                meetingCode: state.meetingCode,
                userId: profile?.id,
              };
              axios.post(
                `${baseUrl2}/valence-arousal/create`,
                valaroBodyPayload,
                {
                  headers: {
                    Authorization: `Bearer ${userStorage.state.accessToken}`,
                  },
                }
              );
              console.log("valaroBodyPayload", valaroBodyPayload);
              handleEmotionChange(emotion);
            });
        } else {
          for (const emotion of negativeEmotions) {
            if (emotionOnly[emotion] > threshold) {
              // Check if the emotion's probability is above the threshold
              const emotionName =
                emotion === "disgusted"
                  ? "Disgust"
                  : emotion === "fearful"
                  ? "Fear"
                  : emotion;

              // If the emotion is the same as the last one and it's been less than a minute, don't show the toast
              if (emotionName === lastEmotion && emotionTimeout) {
                continue;
              }

              // api v2 for intervention words
              axios
                .get(`${baseUrl2}/affective-intervention-text/random`, {
                  params: {
                    emotion: emotionName.toLowerCase(),
                    // category: getArcsResult,
                    category: getReinforcementType.toLowerCase(),
                    name: getFirstName,
                    emotionValue: emotionOnly[emotion],
                    meetingCode: state.meetingCode,
                  },
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                })
                .then((res) => {
                  console.log("res intervention", res);
                  const interventionWords = res.data.text;
                  // if words is more than 2 lines(more than 50 words), add duration of 10 seconds
                  const duration = interventionWords.length > 80 ? 10000 : 5000;

                  showToast(interventionWords, duration);

                  // Set the last emotion and start the timeout
                  lastEmotion = emotionName;
                  if (emotionTimeout) {
                    clearTimeout(emotionTimeout);
                  }
                  emotionTimeout = setTimeout(() => {
                    lastEmotion = null;
                  }, 60000); // 1 minute
                });
            }
          }
        }
      }

      /**
       * OPEN AI TEXT INTERVENTION STATE
       */

      if (state.isStartOpenAiIntervention) {
        emotionOnly = parseProbability(faceApiResult[0].expressions);
        const allEmotions = [
          "angry",
          "disgusted",
          "fearful",
          "sad",
          "happy",
          "surprised",
        ];
        const arcsModel = [
          "attention",
          "relevance",
          "confidence",
          "satisfaction",
        ];

        const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        const threshold = 0.5;

        if (state.selectedRecognitionModel === "EMOVALARO") {
          axios
            .post(
              valaroModelUrl,
              {
                image: canvas.toDataURL("image/jpeg").split(",")[1],
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            .then(({ data }) => {
              const { emotion } = data;
              console.log("valaro emotion", emotion);

              const valaroEmotions = [
                "Anger",
                "Disgust",
                "Fear",
                "Sadness",
                "Happy",
                "Surprised",
              ];
              for (const valaroEmotion of valaroEmotions) {
                if (emotion === valaroEmotion) {
                  const emotionName = capitalise(valaroEmotion);

                  if (emotionName === lastEmotion && emotionTimeout) {
                    continue;
                  }

                  let mappedEmotion = emotionName.toLowerCase();
                  if (mappedEmotion === "sadness") mappedEmotion = "sad";
                  else if (mappedEmotion === "fearful") mappedEmotion = "fear";
                  else if (mappedEmotion === "anger") mappedEmotion = "angry";

                  axios
                    .get(`${OPENAAI_API_URL}`, {
                      params: {
                        emotion: mappedEmotion,
                        classname: getMeetingName,
                        username: getFirstName,
                        subject: getMeetingSubject,
                        arcsmodel:
                          arcsModel[
                            Math.floor(Math.random() * arcsModel.length)
                          ],
                        reinforcement: getReinforcementType.toLowerCase(),
                      },
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    })
                    .then((res) => {
                      const interventionWords = res.data.response;
                      const duration =
                        interventionWords.length > 80 ? 10000 : 5000;

                      showToast(interventionWords, duration);

                      lastEmotion = emotionName;
                      if (emotionTimeout) {
                        clearTimeout(emotionTimeout);
                      }
                      emotionTimeout = setTimeout(() => {
                        lastEmotion = null;
                      }, duration);
                    })
                    .catch((error) => {
                      console.error("OpenAI API call failed", error);
                    });
                }
              }

              const valaroBodyPayload = {
                arousal: data.arousal,
                valence: data.valence,
                emotion: data.emotion,
                emotionPercentages: data.emotion_perc,
                meetingCode: state.meetingCode,
                userId: profile?.id,
              };
              axios.post(
                `${baseUrl2}/valence-arousal/create`,
                valaroBodyPayload,
                {
                  headers: {
                    Authorization: `Bearer ${userStorage.state.accessToken}`,
                  },
                }
              );
              console.log("valaroBodyPayload", valaroBodyPayload);
              handleEmotionChange(emotion);
            });
        } else {
          for (const emotion of allEmotions) {
            if (emotionOnly[emotion] > threshold) {
              const emotionName = capitalise(emotion);

              if (emotionName === lastEmotion && emotionTimeout) {
                continue;
              }

              axios
                .get(`${OPENAAI_API_URL}`, {
                  params: {
                    emotion: emotionName.toLowerCase(),
                    classname: getMeetingName,
                    username: getFirstName,
                    subject: getMeetingSubject,
                    arcsmodel:
                      arcsModel[Math.floor(Math.random() * arcsModel.length)],
                    reinforcement: getReinforcementType.toLowerCase(),
                  },
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                })
                .then((res) => {
                  const interventionWords = res.data.response;
                  const duration = interventionWords.length > 80 ? 10000 : 5000;

                  showToast(interventionWords, duration);

                  lastEmotion = emotionName;
                  if (emotionTimeout) {
                    clearTimeout(emotionTimeout);
                  }
                  emotionTimeout = setTimeout(() => {
                    lastEmotion = null;
                  }, duration);
                })
                .catch((error) => {
                  console.error("OpenAI API call failed", error);
                });
            }
          }
        }
      }

      /**
       * LLAMA AI TEXT INTERVENTION STATE
       */
      if (state.isStartLlamaAiIntervention) {
        emotionOnly = parseProbability(faceApiResult[0].expressions);
        const allEmotions = [
          "angry",
          "disgusted",
          "fearful",
          "sad",
          "happy",
          "surprised",
        ];
        const arcsModel = [
          "attention",
          "relevance",
          "confidence",
          "satisfaction",
        ];

        const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        const threshold = 0.5;

        if (state.selectedRecognitionModel === "EMOVALARO") {
          axios
            .post(
              valaroModelUrl,
              {
                image: canvas.toDataURL("image/jpeg").split(",")[1],
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            .then(({ data }) => {
              const { emotion } = data;
              console.log("valaro emotion", emotion);

              const valaroEmotions = [
                "Anger",
                "Disgust",
                "Fear",
                "Sadness",
                "Happy",
                "Surprised",
              ];
              for (const valaroEmotion of valaroEmotions) {
                if (emotion === valaroEmotion) {
                  const emotionName = capitalise(valaroEmotion);

                  if (emotionName === lastEmotion && emotionTimeout) {
                    continue;
                  }

                  let mappedEmotion = emotionName.toLowerCase();
                  if (mappedEmotion === "sadness") mappedEmotion = "sad";
                  else if (mappedEmotion === "fearful") mappedEmotion = "fear";
                  else if (mappedEmotion === "anger") mappedEmotion = "angry";

                  axios
                    .post(
                      `${LLAMAAI_API_URL}`,
                      {
                        emosi: mappedEmotion,
                        penguatan: getReinforcementType.toLowerCase(),
                        pendekatan:
                          arcsModel[
                            Math.floor(Math.random() * arcsModel.length)
                          ],
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                        },
                      }
                    )
                    .then((res) => {
                      const interventionWords = res.data.response;
                      const duration =
                        interventionWords.length > 80 ? 10000 : 5000;

                      showToast(interventionWords, duration);

                      lastEmotion = emotionName;
                      if (emotionTimeout) {
                        clearTimeout(emotionTimeout);
                      }
                      emotionTimeout = setTimeout(() => {
                        lastEmotion = null;
                      }, duration);
                    })
                    .catch((error) => {
                      console.error("OpenAI API call failed", error);
                    });
                }
              }

              const valaroBodyPayload = {
                arousal: data.arousal,
                valence: data.valence,
                emotion: data.emotion,
                emotionPercentages: data.emotion_perc,
                meetingCode: state.meetingCode,
                userId: profile?.id,
              };
              axios.post(
                `${baseUrl2}/valence-arousal/create`,
                valaroBodyPayload,
                {
                  headers: {
                    Authorization: `Bearer ${userStorage.state.accessToken}`,
                  },
                }
              );
              console.log("valaroBodyPayload", valaroBodyPayload);
              handleEmotionChange(emotion);
            });
        } else {
          for (const emotion of allEmotions) {
            if (emotionOnly[emotion] > threshold) {
              const emotionName = capitalise(emotion);

              if (emotionName === lastEmotion && emotionTimeout) {
                continue;
              }

              axios
                .post(
                  `${LLAMAAI_API_URL}`,
                  {
                    emosi: mappedEmotion,
                    penguatan: getReinforcementType.toLowerCase(),
                    pendekatan:
                      arcsModel[Math.floor(Math.random() * arcsModel.length)],
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                )
                .then((res) => {
                  const interventionWords = res.data.result;
                  console.log("res intervention", res);
                  const duration = interventionWords.length > 80 ? 10000 : 5000;

                  showToast(interventionWords, duration);

                  lastEmotion = emotionName;
                  if (emotionTimeout) {
                    clearTimeout(emotionTimeout);
                  }
                  emotionTimeout = setTimeout(() => {
                    lastEmotion = null;
                  }, duration);
                })
                .catch((error) => {
                  console.error("OpenAI API call failed", error);
                });
            }
          }
        }
      }
      /**
       * GIF INTERVENTION STATE
       * ini akan menampilkan alert intervention berupa gif berdasarkan emosi yang dideteksi
       */

      if (state.isStartFacialIntervention) {
        const emotionMap = {
          angry: "Anger2Neutral",
          disgusted: "Disgusted2Neutral",
          fearful: "Fearful2Neutral",
          sad: "Sad2Happy",
        };
        const positiveEmotionMap = {
          happy: "Happy",
          surprised: "Neutral2Surprised",
          neutral: "Neutral",
        };
        const negativeEmotions = ["angry", "disgusted", "fearful", "sad"];
        const emotionState = getExpression(faceApiResult[0].expressions);
        const mappedNegativeEmotion = emotionMap[emotionState];
        const mappedPositiveEmotion = positiveEmotionMap[emotionState];
        const selectedAgent = state.agent;

        console.log("selectedAgent", selectedAgent);

        let mappedEmotion = mappedNegativeEmotion || mappedPositiveEmotion;
        console.log("mappedEmotion", mappedEmotion);

        if (mappedEmotion) {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            axios
              .get(`${baseUrl}/facial-interventions/emotion`, {
                params: {
                  emotion: mappedEmotion,
                  gender: selectedAgent,
                },
              })
              .then((res) => {
                const base64GifUrl = res.data.data.url;
                showGifAlert(base64GifUrl, true);
              });
          }, 800); // Debounce delay of 300ms
        }
      }

      /**
       * ONLY PREDICTION STATE
       *  Mengirim hasil prediksi ke backendx
       */

      // api
      if (state.selectedRecognitionModel === "FACE_API") {
        if (
          !state.isStartTextIntervention ||
          !state.isStartFacialIntervention
        ) {
          axios.post(`${baseUrl2}/recognition/create`, body, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
      } else if (state.selectedRecognitionModel === "EMOVALARO") {
        if (
          !state.isStartTextIntervention &&
          !state.isStartFacialIntervention
        ) {
          axios
            .post(
              valaroModelUrl,
              {
                image: canvas.toDataURL("image/jpeg").split(",")[1],
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            .then(({ data }) => {
              const { emotion } = data;
              const valaroBodyPayload = {
                arousal: data.arousal,
                valence: data.valence,
                emotion: data.emotion,
                emotionPercentages: data.emotion_perc,
                meetingCode: state.meetingCode,
                userId: profile?.id,
              };

              axios.post(
                `${baseUrl2}/valence-arousal/create`,
                valaroBodyPayload,
                {
                  headers: {
                    Authorization: `Bearer ${userStorage.state.accessToken}`,
                  },
                }
              );
              console.log("valaroBodyPayload", valaroBodyPayload);
              handleEmotionChange(emotion);
            });
        }
      }
    }
  }
};

/**
 * Fungsi untuk mendapatkan ekspresi wajah yang paling mendekati
 *
 * @param {*} expressions : nilai probabilitas dari ekspresi wajah
 *
 * @returns : ekspresi wajah yang paling mendekati
 */
const getExpression = (expressions) => {
  const maxValue = Math.max(...Object.values(expressions));
  return Object.keys(expressions).find(
    (expression) => expressions[expression] === maxValue
  );
};

/**
 * Fungsi untuk mengubah nilai probabilitas menjadi 2 desimal
 * rentang nilai probabilitas adalah 0 - 1
 *
 * @param {*} probability : nilai probabilitas yang didapat dari face-api
 *
 * @returns : nilai probabilitas yang sudah diubah menjadi 2 desimal
 */
const parseProbability = (probability) => {
  return Object.assign(
    ...Object.entries(probability).map((item) => ({
      [item[0]]: Number(item[1].toFixed(2)),
    }))
  );
};

const meetCode = location.pathname.includes("_")
  ? location.pathname.substring(7)
  : location.pathname.substring(1);

init();
