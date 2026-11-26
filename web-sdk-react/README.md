# livedigital Web SDK — React example

[Русская версия](#русская-версия)

A reference video-call app built on [`@livedigital/client`](https://www.npmjs.com/package/@livedigital/client).
It runs live at [sdk-demo.livedigital.space](https://sdk-demo.livedigital.space).

- `server/` — a small Node.js backend. It keeps the Personal Token, creates rooms and issues a `signalingToken`
  for every participant. The three livedigital API calls live in [`server/src/livedigital.ts`](server/src/livedigital.ts).
- `client/` — a React + Vite + TypeScript app structured with [Feature-Sliced Design](https://feature-sliced.design).

## Run locally

Requires Node.js 24+ and yarn.

1. [Create a Personal Token](https://docs.livedigital.space/docs/tutorials/auth/create_personal_token) and a
   [space](https://docs.livedigital.space/docs/tutorials/spaces) for the demo rooms.
2. Configure and start:

```bash
cp .env.example .env   # fill in LIVEDIGITAL_PERSONAL_TOKEN and LIVEDIGITAL_SPACE_ID
yarn install
yarn dev               # client on http://localhost:5173, API on http://localhost:3000
```

The Personal Token is a management key: it must stay on the server and never reach the browser.

## Where to look

| What | Where |
| --- | --- |
| Room, participant and `signalingToken` on the backend | `server/src/livedigital.ts` |
| Single `Client` instance | `client/src/shared/sdk` |
| Join, state sync, reconnect, subscriptions | `client/src/entities/session` |
| Rendering participants and their tracks | `client/src/entities/peer` |
| Device lists and selection | `client/src/entities/device` |
| Lobby: camera preview, microphone level | `client/src/features/preview-media` |
| Camera, microphone, screen sharing, device switch | `client/src/features/local-media` |
| Raised hand through `appData` | `client/src/features/raise-hand` |
| Video effects: blur, virtual background, position in the frame, picture enhancements, LUT color filters, auto framing, lower third | `client/src/features/video-effects` |
| Effects try-on on a separate preview track (`isPreview`): the published track changes only on Apply | `client/src/features/video-effects/model/usePreviewTrack.ts` |
| Noise suppression: Audio Effects SDK with a fallback to RNNoise | `client/src/features/noise-suppression` |
| Network quality: own uplink, downlink and device (`client.networkQuality()`, `network-quality-updated`), shared with other peers through `appData` | `client/src/features/network-quality` |
| Developer mode (`</>`): SDK event log, transport stats, ICE policy and restart | `client/src/features/event-log`, `client/src/features/connection-stats` |
| SDK logs in the app: `onLogMessage` with `logLevel: 7`, a buffer of the last 5000 records, level filter and search | `client/src/features/sdk-log` |
| In-app tutorial hints: what each tab shows, how to get it from the SDK, per-event descriptions and links to the docs | `client/src/shared/ui/ApiNote.tsx`, `client/src/features/event-log/model/catalog.ts`, `client/src/widgets/dev-panel/model/tabs.ts` |
| Per-track debug overlay on tiles: bitrate, fps, loss, jitter, codec, stream scores, simulcast layers, key frame request, pausing a consumer | `client/src/features/track-debug` |
| Diagnostics report: one JSON with session meta, network quality, transports, tracks and recent events | `client/src/widgets/dev-panel` |
| Creating a room and joining it | `client/src/features/join-room` |
| Join and leave notifications | `client/src/features/room-notifications` |
| Call layout: grid, pinned participant, screen share | `client/src/widgets/stage` |
| Settings panel shared by the lobby and the call | `client/src/widgets/media-settings` |
| Playing remote audio, output device | `client/src/shared/ui/AudioView.tsx` |

## Production build

```bash
docker build -t sdk-demo .
docker run --env-file .env -p 3000:3000 sdk-demo
```

---

## Русская версия

Пример приложения для видеозвонков на [`@livedigital/client`](https://www.npmjs.com/package/@livedigital/client).
Работает на [sdk-demo.livedigital.space](https://sdk-demo.livedigital.space).

- `server/` — небольшой бэкенд на Node.js. Хранит Personal Token, создаёт комнаты и выпускает `signalingToken`
  для каждого участника. Три вызова API livedigital лежат в [`server/src/livedigital.ts`](server/src/livedigital.ts).
- `client/` — приложение на React + Vite + TypeScript с архитектурой [Feature-Sliced Design](https://feature-sliced.design).

## Локальный запуск

Нужны Node.js 24+ и yarn.

1. [Создайте Personal Token](https://docs.livedigital.space/docs/tutorials/auth/create_personal_token) и
   [пространство](https://docs.livedigital.space/docs/tutorials/spaces) для комнат демо.
2. Настройте и запустите:

```bash
cp .env.example .env   # заполните LIVEDIGITAL_PERSONAL_TOKEN и LIVEDIGITAL_SPACE_ID
yarn install
yarn dev               # клиент на http://localhost:5173, API на http://localhost:3000
```

Personal Token — управляющий ключ: он живёт только на сервере и не должен попадать в браузер.

## Где что смотреть

| Что | Где |
| --- | --- |
| Комната, участник и `signalingToken` на бэкенде | `server/src/livedigital.ts` |
| Единственный экземпляр `Client` | `client/src/shared/sdk` |
| Вход, синхронизация состояния, реконнект, подписки | `client/src/entities/session` |
| Отрисовка участников и их треков | `client/src/entities/peer` |
| Списки устройств и выбор | `client/src/entities/device` |
| Лобби: превью камеры, уровень микрофона | `client/src/features/preview-media` |
| Камера, микрофон, демонстрация экрана, смена устройства | `client/src/features/local-media` |
| Поднятая рука через `appData` | `client/src/features/raise-hand` |
| Видеоэффекты: размытие и замена фона, положение в кадре, улучшения картинки, цветовые LUT-фильтры, автокадрирование, плашка с именем | `client/src/features/video-effects` |
| Примерка эффектов на отдельном треке предпросмотра (`isPreview`): опубликованный трек меняется только по «Применить» | `client/src/features/video-effects/model/usePreviewTrack.ts` |
| Шумоподавление: Audio Effects SDK с откатом на RNNoise | `client/src/features/noise-suppression` |
| Качество сети: своя отправка, приём и устройство (`client.networkQuality()`, `network-quality-updated`), передача остальным участникам через `appData` | `client/src/features/network-quality` |
| Режим разработчика (`</>`): журнал событий SDK, статистика транспортов, ICE-политика и перезапуск ICE | `client/src/features/event-log`, `client/src/features/connection-stats` |
| Логи SDK в приложении: `onLogMessage` с `logLevel: 7`, буфер на 5000 последних записей, фильтр по уровню и поиск | `client/src/features/sdk-log` |
| Учебные подсказки в интерфейсе: что показывает вкладка, как получить это из SDK, описание каждого события и ссылки на документацию | `client/src/shared/ui/ApiNote.tsx`, `client/src/features/event-log/model/catalog.ts`, `client/src/widgets/dev-panel/model/tabs.ts` |
| Отладочный оверлей на плитках: битрейт, fps, потери, джиттер, кодек, оценки потока, слои simulcast, запрос ключевого кадра, пауза приёма | `client/src/features/track-debug` |
| Диагностический отчёт: один JSON с данными сессии, качеством сети, транспортами, треками и последними событиями | `client/src/widgets/dev-panel` |
| Создание комнаты и вход | `client/src/features/join-room` |
| Уведомления о входе и выходе участников | `client/src/features/room-notifications` |
| Сцена звонка: сетка, закреплённый участник, демонстрация | `client/src/widgets/stage` |
| Панель настроек, общая для лобби и звонка | `client/src/widgets/media-settings` |
| Воспроизведение звука участников, устройство вывода | `client/src/shared/ui/AudioView.tsx` |

## Сборка для продакшена

```bash
docker build -t sdk-demo .
docker run --env-file .env -p 3000:3000 sdk-demo
```
