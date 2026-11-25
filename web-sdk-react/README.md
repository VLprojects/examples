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
| Publishing camera and microphone | `client/src/features/local-media` |

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
| Публикация камеры и микрофона | `client/src/features/local-media` |

## Сборка для продакшена

```bash
docker build -t sdk-demo .
docker run --env-file .env -p 3000:3000 sdk-demo
```
