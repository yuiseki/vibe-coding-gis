# vibe-coding-gis

このリポジトリ vibe-coding-gis は、コーディング AI エージェントによって GIS プログラミングを試みる実験的なリポジトリである。

## ディレクトリ構造

vibe-coding-gis 以下に、さらにサブディレクトリを作成する。

## 開発方針

必要に応じて既存のサブディレクトリの実装内容を注意深く参照すること。

### Web 地図を作る場合

- npm を使用すること。
- Typescript を使用すること。
- React.js を使用すること。
- Vite.js を使用すること。
  - `npm create -y vite@latest new-project-name -- --template react-ts` でプロジェクトを作成すること。
- maplibre-gl と react-map-gl を使用すること。
  - react-map-gl は、 `import ... from "react-map-gl/maplibre";` のようにインポートすること。
- ブラウザ標準の Fetch API などを活用し、なるべく余計な依存関係を追加しないこと。
- 地図スタイルファイルに特に指定がない場合は、以下の URL を使用すること。
  - https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json
- `npm run dev` でローカルサーバーを起動すること。
  - なるべくブラウザで動作確認もすること。特に、地図が視覚的に意図通りに表示されているか、スクリーンショットで確認すること。
