import { useEffect, useState } from "react";
import "./App.css";

import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// 台東区のラーメン店の情報を格納する型定義
type RamenShop = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  cuisine?: string;
};

function App() {
  // 地図の初期表示位置（台東区の中心付近）
  const [viewState, setViewState] = useState({
    longitude: 139.7891,
    latitude: 35.7147,
    zoom: 14,
  });

  // ラーメン店データ
  const [ramenShops, setRamenShops] = useState<RamenShop[]>([]);
  // 読み込み中のステータス
  const [loading, setLoading] = useState(true);
  // 選択されたラーメン店
  const [selectedShop, setSelectedShop] = useState<RamenShop | null>(null);

  // Overpass APIを使って台東区のラーメン店を取得する
  useEffect(() => {
    const fetchRamenShops = async () => {
      try {
        setLoading(true);
        // Overpass APIのクエリ
        // 台東区のエリア内のラーメン店（amenity=restaurant, cuisine=ramen）を検索
        const query = `
          [out:json];
          area["name"="台東区"]->.taito;
          (
            node["amenity"="restaurant"]["cuisine"="ramen"](area.taito);
            node["amenity"="fast_food"]["cuisine"="ramen"](area.taito);
            node["shop"="noodle"](area.taito);
          );
          out body;
        `;

        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: query,
          }
        );

        const data = await response.json();

        // 取得したデータをRamenShop型に変換
        const shops: RamenShop[] = data.elements.map((element: any) => {
          return {
            id: element.id.toString(),
            name: element.tags.name || "名称不明のラーメン店",
            lat: element.lat,
            lon: element.lon,
            address: element.tags["addr:full"] || element.tags["addr:street"],
            cuisine: element.tags.cuisine,
          };
        });

        setRamenShops(shops);
      } catch (error) {
        console.error("ラーメン店データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRamenShops();
  }, []);

  return (
    <div className="map-container">
      <h1>台東区ラーメンマップ</h1>
      {loading ? (
        <div className="loading">ラーメン店データを読み込み中...</div>
      ) : (
        <div className="shop-count">
          {ramenShops.length}件のラーメン店が見つかりました
        </div>
      )}

      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={maplibregl}
        mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
        style={{ width: "100%", height: "calc(100vh - 100px)" }}
      >
        <NavigationControl position="top-right" />

        {/* ラーメン店のマーカー表示 */}
        {ramenShops.map((shop) => (
          <Marker
            key={shop.id}
            longitude={shop.lon}
            latitude={shop.lat}
            color="#FF4500"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedShop(shop);
            }}
          />
        ))}

        {/* 選択されたラーメン店の情報ポップアップ */}
        {selectedShop && (
          <Popup
            longitude={selectedShop.lon}
            latitude={selectedShop.lat}
            anchor="bottom"
            onClose={() => setSelectedShop(null)}
          >
            <div className="popup-content">
              <h3>{selectedShop.name}</h3>
              {selectedShop.address && <p>住所: {selectedShop.address}</p>}
              {selectedShop.cuisine && <p>料理: {selectedShop.cuisine}</p>}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

export default App;
