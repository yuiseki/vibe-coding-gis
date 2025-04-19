import "./App.css";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function App() {
  // 東京都の中心座標（東京駅付近）
  const TOKYO_CENTER = {
    longitude: 139.7671,
    latitude: 35.6812,
    zoom: 10,
  };

  return (
    <div className="map-container">
      <Map
        mapLib={maplibregl}
        initialViewState={TOKYO_CENTER}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
      >
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
}

export default App;
