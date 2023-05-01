# Учебный репозиторий с текущими примерами

## Отправные точки

- [0_base_sketch](https://github.com/alexlipovka/23_masters/tree/main/0_base_sketch) — Простейший скетч p5js
- [1_base_mappa_sketch](https://github.com/alexlipovka/23_masters/tree/main/1_base_mappa_sketch) — Простейший скетч p5js + mappa
- [2_mappa_study](https://github.com/alexlipovka/23_masters/tree/main/2_mappa_study) — Создаем объекты с геопривязкой поверх карты
- [5_overpass](https://github.com/alexlipovka/23_masters/tree/main/5_overpass) — Делаем запрос на OSM через Overpass API

## Симуляции

### По мотивам книги «The Nature Of Code»

- [Nature of Code](https://github.com/alexlipovka/23_masters/tree/main/natureofcode)
  - [0_ball](https://github.com/alexlipovka/23_masters/tree/main/natureofcode/0_ball) — Знакомство с векторами, гравитацией, анимацией
  - [1_ball](https://github.com/alexlipovka/23_masters/tree/main/natureofcode/1_ball) — Создаем массив объектов
  - [2_attractor](https://github.com/alexlipovka/23_masters/tree/main/natureofcode/2_attractor) — Вместо общего поля вводим аттрактор и интерфейс на p5.GUI
  - [2_attractor_datGUI](https://github.com/alexlipovka/23_masters/tree/main/natureofcode/2_attractor_datGUI) — Вместо общего поля вводим аттрактор и интерфейс на dat.GUI
  - [3_particleSystems](https://github.com/alexlipovka/23_masters/tree/main/natureofcode/3_particleSystems)
  - [4_vehicles](https://github.com/alexlipovka/23_masters/tree/main/natureofcode/4_vehicles)

## Загрузка сторонних геоданных

### Загрузка геоданных через Overpass API

- [OSM](https://github.com/alexlipovka/23_masters/tree/main/OSM)

### Загрузка тайлов через Leaflet via Mappa.js

- [Leaflet-backed](https://github.com/alexlipovka/23_masters/tree/main/Leaflet-backed)
  - [2_mappa_study](https://github.com/alexlipovka/23_masters/tree/main/Leaflet-backed/2_mappa_study)
  - [3_mappa_draw](https://github.com/alexlipovka/23_masters/tree/main/Leaflet-backed/3_mappa_draw)
  - [4_tiles_rgb](https://github.com/alexlipovka/23_masters/tree/main/Leaflet-backed/4_tiles_rgb)
  - [10_raster_analysis](https://github.com/alexlipovka/23_masters/tree/main/Leaflet-backed/10_raster_analysis)

### Самостоятельная загрузка тайлов с WMTS-серверов

- [Lite-map](https://github.com/alexlipovka/23_masters/tree/main/lite-map)
  - [Tile Mosaic](https://github.com/alexlipovka/23_masters/tree/main/lite-map/custom_map)		

## Установка внешних библиотек

Изначально планировалось для внедрения p5gui, но в результате остановились на datGUI.

```bash
git submodule init
git submodule update
```