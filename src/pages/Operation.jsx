import { useEffect, useState, useRef } from "react";
import { useData } from "../contexts/dataContext.jsx";
import soundfx from "../assets/beep.wav";
import spacebar from "../assets/spacebar.png";
import mkey from "../assets/mkey.png";

export function Operation() {
  const { stratagems } = useData();
  const [randomStratagem, setRandomStratagem] = useState(null);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [allKeysMatched, setAllKeysMatched] = useState(false);
  const [deployPressed, setDeployPressed] = useState(false);
  const [monitorPressed, setMonitorPressed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [stratagemsDeployed, setStratagemsDeployed] = useState(0);
  const [correctInputs, setCorrectInputs] = useState(0);
  const [incorrectInputs, setIncorrectInputs] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const audio = new Audio(soundfx);
  let count = 0;
  let currentIndex = null;

  const arrowMap = {
    up: "\u2B06",
    down: "\u2B07",
    left: "\u2B05",
    right: "\u2B95",
  };

  useEffect(() => {
    if (stratagems && stratagems.length > 0) {
      loadRandomStratagem();
    }
  }, [stratagems]);

  useEffect(() => {
    if (randomStratagem) {
      document.addEventListener("keydown", handleArrowKeys);
      document.addEventListener("keydown", handleSpacebar);
      document.addEventListener("keydown", handleMonitorEvent);
      return () => {
        document.removeEventListener("keydown", handleArrowKeys);
        document.removeEventListener("keydown", handleSpacebar);
        document.removeEventListener("keydown", handleMonitorEvent);
      };
    }
  }, [randomStratagem, allKeysMatched]);

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      loadRandomStratagem();
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timer]);

  function loadRandomStratagem() {
    const randomIndex = Math.floor(Math.random() * stratagems.length);
    setRandomStratagem(stratagems[randomIndex]);
    setMatchedKeys([]);
    setAllKeysMatched(false);
    setDeployPressed(false);
    count = 0;
  }

  function handleArrowKeys(event) {
    if (
      (event.key === "ArrowUp" && randomStratagem.keys[count] === "up") ||
      (event.key === "ArrowDown" && randomStratagem.keys[count] === "down") ||
      (event.key === "ArrowLeft" && randomStratagem.keys[count] === "left") ||
      (event.key === "ArrowRight" && randomStratagem.keys[count] === "right")
    ) {
      currentIndex = count;
      setMatchedKeys((prev) => [...prev, currentIndex]);
      count++;
      if (isTimerRunning) {
        setCorrectInputs((prev) => prev + 1);
      }
      audio.play();
      if (count === randomStratagem.keys.length) {
        setAllKeysMatched(true);
      }
    } else {
      if (isTimerRunning) {
        if (event.key === " " && allKeysMatched == true) {
          setCorrectInputs((prev) => prev + 1);
        } else {
          setIncorrectInputs((prev) => prev + 1);
        }
      }
      setMatchedKeys([]);
      count = 0;
    }
  }

  function buttonTransition(setPressed) {
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
    }, 200);
  }

  function handleSpacebar(event) {
    if (event.key === " ") {
      buttonTransition(setDeployPressed)
      if (allKeysMatched) {
        setDeployPressed(true);
      setTimeout(() => {
        loadRandomStratagem();
        setDeployPressed(false);
      }, 200);
        if (isTimerRunning) {
          setStratagemsDeployed((prev) => prev + 1);
        }
      }
    }
  }

  function handleDeployClick() {
    buttonTransition(setDeployPressed)
    if (allKeysMatched) {
      setDeployPressed(true);
      setTimeout(() => {
        setDeployPressed(false);
        loadRandomStratagem();
      }, 200);
    } else {
      setMatchedKeys([]);
      count = 0;
    }
  }

  function startMonitoring () {
    if (!isTimerRunning && count === 0) {
      buttonTransition(setMonitorPressed)
      setTimer(60);
      setIsTimerRunning(true);
      setStratagemsDeployed(0);
      setCorrectInputs(0);
      setIncorrectInputs(0);
      loadRandomStratagem();
    }
  }
  
  function handleMonitorEvent(event) {
    if (event.type === "click" || (event.type === "keydown" && event.key === "m")) {
      buttonTransition(setMonitorPressed)
      startMonitoring();
    }
  }

  function renderStratagem() {
    if (!randomStratagem) return null;

    return (
      <>
        <div className="stratagem__head">
          <img src={randomStratagem.imageUrl} className="stratagem__icon" />
          <h2>{randomStratagem.name}</h2>
        </div>

        <div className="stratagem__keys">
          {randomStratagem.keys.map((key, index) => (
            <span
              key={index}
              className={`arrow ${matchedKeys.includes(index) ? "matched" : ""}`}
            >
              {arrowMap[key]}
            </span>
          ))}
        </div>
      </>
    );
  }

  return (
    <section className="game">
      <div className="game__bar">
        <p>Time Left: {timer}</p>
        <div className="game__stats">
          <p>ACC: {(correctInputs / (correctInputs + incorrectInputs) * 100).toFixed(2) + "%"}</p>
          <p>/</p>
          <p>DPM: {stratagemsDeployed}</p>
        </div>
      </div>
      <div className="game__stratagem">
        {renderStratagem()}
      </div>
      <div className="game__buttons">
        <div className={`game__button ${monitorPressed ? "pressed" : ""}`} onClick={handleMonitorEvent}> 
          <img src={mkey} className="spacebar__icon" />
            <p className="deploy__text">MONITOR</p>
        </div>
        <div className={`game__button ${deployPressed ? "pressed" : ""}`} onClick={handleDeployClick}>
          <img src={spacebar} className="spacebar__icon" />
          <p className="deploy__text">DEPLOY</p>
        </div>
      </div>

    </section>
  );
}