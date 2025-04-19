import { useEffect, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

// 代々木公園のおおよその中心座標
const YOYOGI_PARK_CENTER = {
  longitude: 139.6971,
  latitude: 35.6716,
};

// Overpass APIのエンドポイント
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

// 代々木公園のポリゴンを取得するOverpass APIクエリ
const YOYOGI_PARK_QUERY = `
[out:json];
(
  // 代々木公園のリレーション
  relation["name"="代々木公園"];
  // 代々木公園のウェイ
  way["name"="代々木公園"];
);
out body;
>;
out skel qt;
`;

function App() {
  const [parkData, setParkData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Overpass APIから代々木公園のデータを取得
    const fetchYoyogiParkData = async () => {
      try {
        setLoading(true);
        const response = await fetch(OVERPASS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(YOYOGI_PARK_QUERY)}`,
        });

        if (!response.ok) {
          throw new Error(`Overpass API error: ${response.status}`);
        }

        const data = await response.json();

        // Overpass APIのレスポンスをGeoJSONに変換
        const geoJson = osmToGeoJson(data);
        setParkData(geoJson);
      } catch (err) {
        console.error("Failed to fetch park data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchYoyogiParkData();
  }, []);

  // Overpass APIのデータをGeoJSONに変換する関数
  const osmToGeoJson = (osmData: any) => {
    // ノードの辞書を作成
    const nodes: { [id: string]: [number, number] } = {};
    osmData.elements.forEach((element: any) => {
      if (element.type === "node") {
        nodes[element.id] = [element.lon, element.lat];
      }
    });

    // GeoJSONフィーチャーの配列
    const features: any[] = [];

    // ウェイとリレーションを処理
    osmData.elements.forEach((element: any) => {
      if (element.type === "way" && element.nodes) {
        // ウェイのポリゴンを追加
        const coordinates = element.nodes.map(
          (nodeId: number) => nodes[nodeId]
        );

        // 最初と最後のノードが同じであればポリゴン、そうでなければラインストリング
        const isPolygon =
          element.nodes[0] === element.nodes[element.nodes.length - 1];

        features.push({
          type: "Feature",
          properties: element.tags || {},
          geometry: {
            type: isPolygon ? "Polygon" : "LineString",
            coordinates: isPolygon ? [coordinates] : coordinates,
          },
          id: element.id,
        });
      }
    });

    return {
      type: "FeatureCollection",
      features,
    };
  };

  // 代々木公園ポリゴンのスタイル
  const parkLayerStyle: LayerProps = {
    id: "yoyogi-park-polygon",
    type: "fill",
    paint: {
      "fill-color": "#0f0", // 緑色
      "fill-opacity": 0.5,
    },
  };

  const parkOutlineStyle: LayerProps = {
    id: "yoyogi-park-outline",
    type: "line",
    paint: {
      "line-color": "#060", // 濃い緑
      "line-width": 2,
    },
  };

  return (
    <div className="app-container">
      <header>
        <h1>代々木公園地図</h1>
      </header>

      <div className="map-container">
        {error && <div className="error-message">エラー: {error}</div>}
        {loading && <div className="loading-message">データ読み込み中...</div>}

        <Map
          initialViewState={{
            longitude: YOYOGI_PARK_CENTER.longitude,
            latitude: YOYOGI_PARK_CENTER.latitude,
            zoom: 14,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
        >
          {parkData && (
            <Source type="geojson" data={parkData}>
              <Layer {...parkLayerStyle} />
              <Layer {...parkOutlineStyle} />
            </Source>
          )}
        </Map>
      </div>
    </div>
  );
}

export default App;
