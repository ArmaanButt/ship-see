import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import useWebSocket from "react-use-websocket";

function App() {
  const [count, setCount] = useState(0);
  const [messageHistory, setMessageHistory] = useState([]);

  const [ships, SetShips] = useState({});

  const [socketUrl, setSocketUrl] = useState("/ws");

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log(lastJsonMessage);
      setMessageHistory((prev) => prev.concat(lastJsonMessage));
      SetShips((prev) => {
        prev[lastJsonMessage.MetaData.MMSI_String] = lastJsonMessage.MetaData;
        return prev;
      });
    }
  }, [lastJsonMessage]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
