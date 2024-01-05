import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";

import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";

import ACTIONS from "../actions";

import "./editor.css";
import Hamburger from "../icons/Hamburger";
import Cancel from "../icons/Cancel";
import Run from "../icons/Run";
import axios from "axios";
import toast from "react-hot-toast";
import { CirclesWithBar } from "react-loader-spinner";
import Pause from "../icons/Pause";
import codemirror from "codemirror";
import ArrowDown from "../icons/ArrowDown";
import { useNavigate } from "react-router-dom";
import stubs from "../defaultS/tubs";
import moment from "moment";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [sideBar, setSideBar] = useState(true);
  const [language, setLanguage] = useState(null);
  const [wrCode, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState("javascript");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [time, setTime] = useState(null);
  const typingRef = useRef(null);
  const cursorRef = useRef(0);

  const refBox = useRef(null);
  const refTop = useRef(null);
  const refLeft = useRef(null);
  const reactNavigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      setIsMobile(true);
    } else {
    }
  }, []);

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          node: {
            name: "javascript",
            json: true,
          },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          mode: mode,
          lineWrapping: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();

        onCodeChange(code);
        setCode(code);

        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });

      editorRef.current.on("keyup", (instance) => {
        const { line } = instance.getCursor();
        cursorRef.current = line;
        socketRef.current.emit("Typer", {
          roomId,
          lineNo: cursorRef.current,
        });
      });
    }
    init();

    if (socketRef.current) {
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(err) {
        toast.error("Connection failed. Please try again later.");
        reactNavigate("/");
      }
    }

    return () => {
      editorRef.current.toTextArea();
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off("connect_error");
      socketRef.current.off("connect_failed");
      socketRef.current.off("Typer");
    };
  }, [mode]);

  useEffect(() => {
    const resizableElement = refBox.current;
    const styles = window.getComputedStyle(resizableElement);

    let width = parseInt(styles.width, 10);
    let height = parseInt(styles.height, 10);

    let xCord = 0;
    let yCord = 0;

    resizableElement.style.top = "0px";
    resizableElement.style.left = "0px";

    // TOP
    const onMouseMoveTopResize = (e) => {
      const dy = e.clientY - yCord;
      height = height - dy;
      yCord = e.clientY;
      resizableElement.style.height = `${height}px`;
    };

    const onMouseUpTopResize = () => {
      document.removeEventListener("mousemove", onMouseMoveTopResize);
    };

    const onMouseDownTopResize = (e) => {
      yCord = e.clientY;
      const styles = window.getComputedStyle(resizableElement);
      resizableElement.style.bottom = styles.bottom;
      resizableElement.style.top = null;
      document.addEventListener("mousemove", onMouseMoveTopResize);
      document.addEventListener("mouseup", onMouseUpTopResize);
    };

    // left
    const onMouseMoveLeftResize = (e) => {
      const dx = e.clientX - xCord;
      width = width - dx;
      xCord = e.clientX;
      resizableElement.style.width = `${width}px`;
    };

    const onMouseUpLeftResize = (e) => {
      document.removeEventListener("mousemove", onMouseMoveLeftResize);
    };

    const onMouseDownLeftResize = (e) => {
      xCord = e.clientX;
      resizableElement.style.right = styles.right;
      resizableElement.style.left = null;
      document.addEventListener("mousemove", onMouseMoveLeftResize);
      document.addEventListener("mouseup", onMouseUpLeftResize);
    };

    // add event listeners

    const resizerRight = refTop.current;
    resizerRight.addEventListener("mousedown", onMouseDownTopResize);

    const resizerLeft = refLeft.current;
    resizerLeft.addEventListener("mousedown", onMouseDownLeftResize);

    return () => {
      resizerRight.removeEventListener("mousedown", onMouseDownTopResize);
    };
  }, [sideBar]);

  useEffect(() => {
    if (socketRef.current) {
      // get current code ...
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code, username }) => {
        if (code) {
          editorRef.current.setValue(code);
          setCode(code);
        }
      });

      socketRef.current.on(
        "UTILS",
        ({ language, output, error, mode, loading }) => {
          console.log("utils", language, output, error, mode, loading);
          setLanguage(language);
          setError(error);
          setMode(mode);
          setOutput(output);
          setLoading(loading);
        }
      );

      // get current typing user ...
      socketRef.current.on("Typer", ({ username, socketId, lineNo }) => {
        // cursorRef.current = lineNo;
        // if (lineNo === 0) return;
        cursorRef.current = lineNo;
        const CodeMirrorCode =
          document.getElementsByClassName("CodeMirror-code")[0];
        const CodeMirrorLine =
          CodeMirrorCode?.childNodes[lineNo]?.childNodes[1]?.childNodes[0];
        if (CodeMirrorLine === undefined) return;
        // space creates a new child node
        let textLength = 0;
        const numOfchild = CodeMirrorLine.childNodes.length;
        console.log("numOfchild", numOfchild);
        let fixedLine;
        for (let i = 1; i <= numOfchild; i++) {
          fixedLine = CodeMirrorLine.childNodes[i - 1];
          textLength += fixedLine.textContent.length;
        }

        if (CodeMirrorCode.childNodes.length >= 0) {
          CodeMirrorCode.childNodes.forEach((line, index) => {
            if (index !== lineNo) {
              line.childNodes[1].childNodes[0].classList.remove(
                "pointerWrapper"
              );
              line.childNodes[1].childNodes[0].classList.remove("borderRight");
              const pointer = document.getElementsByClassName("pointer")[0];
              if (pointer) {
                pointer.remove();
              }
            }
          });
        }

        if (socketId !== socketRef.current.id) {
          const prevPointer = document.getElementsByClassName("pointer")[0];
          if (prevPointer) {
            prevPointer.remove();
          }
          CodeMirrorLine.classList.add("pointerWrapper");
          const pointer = document.createElement("div");
          pointer.className = "pointer";

          pointer.textContent = username;
          if (fixedLine.length === undefined) {
            fixedLine.appendChild(pointer);
            pointer.style.left = `${textLength * 10}px`;
            CodeMirrorLine.classList.add("borderRight");
          } else {
          }
        } else {
          const prevPointer = document.getElementsByClassName("pointer")[0];
          if (prevPointer) {
            prevPointer.remove();
          }
          CodeMirrorLine.classList.add("pointerWrapper");
          if (fixedLine.length === undefined) {
            console.log("fixedLine", fixedLine);
            if (!fixedLine.classList.contains("cm-variable")) {
              console.log("not variable");
              return;
            } else {
              const pointer = document.createElement("span");
              pointer.className = "pointer";
              if (!isMobile) pointer.textContent = "You";
              fixedLine.appendChild(pointer);
              pointer.style.left = `${textLength * 10}px`;
              CodeMirrorLine.classList.add("borderRight");
            }
          }
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off("Typer");
      socketRef.current.off("UTILS");
    };
  }, [socketRef.current]);

  const emitUtils = (e) => {
    socketRef.current.emit("UTILS", {
      roomId,
      language,
      error,
      mode,
      loading,
      output,
    });
  };

  useEffect(() => {
    if (language === null) return;
    if (language === "js") setMode("javascript");
    else if (language === "py") setMode("python");
    else if (language === "cpp") setMode("clike");
    if (socketRef.current) {
      editorRef.current.setValue(stubs[language]);
      setCode(stubs[language]);
      emitUtils();
    }
  }, [language, output]);

  // run code from my server
  const executeCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setJobId("");
      setOutput("");
      setStatus("");
      setJobDetails(null);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/run`,
        {
          code: wrCode,
          language,
        }
      );
      console.log("response", response.data);
      if (response.status === 201) {
        const { jobId } = response.data;
        setJobId(jobId);
        let intervalId;
        intervalId = setInterval(async () => {
          const { data: dataRes } = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/status?id=${jobId}`
          );
          console.log("dataRes", dataRes);
          const { success, output: resOutput } = dataRes;
          if (success) {
            const { status, output: jobOutput } = resOutput;
            setStatus(status);
            setJobDetails(resOutput);
            if (status === "running") return;
            setOutput(jobOutput);
            clearInterval(intervalId);
          } else {
            setStatus("Error! please retry.");
            setOutput(resOutput);
            clearInterval(intervalId);
          }
        });
      }
      setError(false);
    } catch (e) {
      setError(true);
      setOutput(e.response.data.output.stderr);
    } finally {
      setLoading(false);
    }
  };

  // run code from judge0 api
  const executeCodeJudge0 = async (e) => {
    console.log("wrCode", wrCode);
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: {
        base64_encoded: "true",
        fields: "*",
      },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "dd52b6c22amsh14abec8837003cap10e8f7jsnc8a3530dc0a9",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      data: {
        language_id: language === "js" ? 63 : language === "py" ? 71 : 54,
        source_code: btoa(wrCode),
        stdin: "SnVkZ2Uw",
      },
    };

    try {
      setLoading(true);
      const response = await axios.request(options);
      const { token } = response.data;
      console.log("token", token);

      setTimeout(async () => {
        const { data: dataRes } = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              "X-RapidAPI-Key":
                "dd52b6c22amsh14abec8837003cap10e8f7jsnc8a3530dc0a9",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );
        console.log("dataRes", dataRes);
        const { status, stdout, stderr } = dataRes;
        if (status.id === 3) {
          setStatus("completed");
          setTime(dataRes.time);
          setLoading(false);
          setOutput(stdout);
        } else if (status.id === 5) {
          setStatus("completed");
          setOutput(stderr);
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const renderTimeDetails = () => {
    if (jobDetails === null) return "";
    const { startedAt, completedAt } = jobDetails;
    const startedAtTime = moment(startedAt).format("hh:mm:ss");
    const completedAtTime = moment(completedAt).format("hh:mm:ss");
    const executedTime = moment(completedAt).diff(
      moment(startedAt),
      "seconds",
      true
    );
    return (
      <div className="timeDetails">
        <p>Started at: {startedAtTime}</p>
        <p>Completed at: {completedAtTime}</p>
        <p>Execution Time: {executedTime}s</p>
      </div>
    );
  };

  return (
    <div className="editorWrapper">
      <div className="codeWrapper">
        <textarea id="realtimeEditor"></textarea>
      </div>

      <button className="consoleBtn" onClick={() => setSideBar(!sideBar)}>
        {sideBar ? <Hamburger /> : <Cancel />}
      </button>
      <button
        onClick={(e) => executeCodeJudge0(e)}
        className="consoleBtn runBtn"
      >
        {loading ? <Pause /> : <Run />}
        {loading ? "Running" : "Run"}
      </button>
      <label className="dropdown1">
        {language}
        <ArrowDown />
      </label>
      <select
        onChange={(e) => {
          console.log(e.target.value);

          if (e.target.value === "93") {
            console.log("js");
            setLanguage("js");
            setMode("javascript");
          } else if (e.target.value === "70") {
            console.log("py");
            setLanguage("py");
            setMode("python");
          } else if (e.target.value === "75") {
            console.log("cpp");
            setLanguage("cpp");
            setMode("clike");
          }
        }}
        className="dropdown"
      >
        <option value={0}>Select</option>
        <option value={93}>javascript</option>
        <option value={70}>python</option>
        <option value={75}>c++</option>
      </select>
      <div
        className="sidebar"
        style={{
          display: sideBar ? "block" : "none",
        }}
      >
        <div className="wrapper">
          <div ref={refBox} className="resizable-box">
            <div ref={refLeft} className="resizer rl"></div>
            <div ref={refTop} className="resizer rt"></div>

            <div className="console">
              <h3 className="consoleTitle">Output</h3>
              {/* <p>{jobId && `JobID: ${jobId}`}</p> */}
              <p
                style={{
                  color: status === "success" ? "green" : "red",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                {status}
              </p>
              <p className="timeDetails">
                {time && `Execution Time: ${time}s`}
              </p>
              {loading ? (
                <CirclesWithBar />
              ) : (
                <textarea
                  readOnly
                  value={output}
                  placeholder="Output will be displayed here"
                  className="outputConsole"
                  style={{
                    color: error ? "red" : "white",
                  }}
                ></textarea>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
