import { useState, useEffect } from "react";

import "./App.css";
import "leaflet/dist/leaflet.css";
import useWebSocket from "react-use-websocket";

import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";

function App() {
  const position = [37.74754, -122.33417];

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
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {Object.values(ships).map((e) => {
          return (
            <Marker key={e.MMSI} position={[e.latitude, e.longitude]}>
              <Popup>{e.ShipName}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}

export default App;
