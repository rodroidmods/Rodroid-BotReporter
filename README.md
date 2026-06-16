# Rodroid Bug-Reporter Bot

A Telegram bot for collecting and managing bug reports for Rodroid apps. Users submit structured reports with descriptions, severity levels, and media attachments — all forwarded to the developer with a gallery carousel and full management tools.

## Features

- **Guided Report Wizard** — step-by-step conversation flow: app selection → description → severity → media attachments
- **Multi-language Support** — English, Arabic, Russian (auto-detected from Telegram profile)
- **Media Gallery Carousel** — photos/videos sent with inline navigation (Back/Next) and per-photo captions
- **Album Support** — media groups sent by users are collected properly without crashes
- **Report Tracking** — each report gets a unique ID (e.g. `RPT-ABCD1234`) with status tracking
- **Owner Commands** — reply to users, change status, search reports, view statistics
- **Report Editing** — users can edit their report within 5 minutes of submission
- **Rate Limiting** — prevents spam from users
- **SQLite Storage** — sessions, reports, and galleries stored locally
- **Graceful Shutdown** — handles SIGINT/SIGTERM cleanly

## Commands

### User Commands
| Command | Description |
|---------|-------------|
| `/start` | Start the bot |
| `/help` | How to report a bug |
| `/status RPT-XXXX` | Check a report's status |
| `/myreports` | View your recent reports |
| `/edit` | Edit your last report (5 min window) |
| `/cancel` | Cancel current action |

### Owner Commands (visible only to the owner)
| Command | Description |
|---------|-------------|
| `/reply RPT-XXXX message` | Reply to a user by report ID |
| `/reply message` | Reply by quoting the report message |
| `/changestatus RPT-XXXX` | Change report status (shows buttons) |
| `/changestatus` | Same, by quoting the report message |
| `/stats` | View report statistics |
| `/search query` | Search reports |

The owner can also reply directly to a report message — the response is forwarded to the user automatically.

## Setup

### Requirements

- Node.js **22.5+** (uses built-in `node:sqlite`)

### Installation

```bash
git clone https://github.com/your-repo/rodroid-botreporter.git
cd rodroid-botreporter
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in:

```env
BOT_TOKEN=your_bot_token_here
OWNER_CHAT_ID=your_telegram_user_id_here
```

- `BOT_TOKEN` — get from [@BotFather](https://t.me/BotFather)
- `OWNER_CHAT_ID` — your Telegram numeric user ID (reports are forwarded here)

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Project Structure

```
src/
├── bot.ts                    # Entry point, middleware setup
├── config/
│   ├── env.ts               # Environment validation (Zod)
│   └── db.ts                # Shared SQLite connection
├── types/
│   └── context.ts           # Custom context type
├── middlewares/
│   ├── session.ts           # SQLite session storage
│   └── ratelimiter.ts       # Rate limiting
├── conversations/
│   └── reportWizard.ts      # Report submission flow
├── handlers/
│   ├── commands.ts          # Bot commands & menu
│   ├── ownerReply.ts        # Owner reply & status management
│   ├── editHandler.ts       # Report editing
│   └── gallery.ts           # Photo carousel navigation
└── utils/
    ├── formatters.ts        # HTML formatting & escaping
    ├── reportsStore.ts      # Report CRUD operations
    ├── gallery.ts           # Gallery storage
    ├── topicManager.ts      # Forum topic management
    └── i18n.ts              # Translations (en/ar/ru)
```

## Tech Stack

- [grammY](https://grammy.dev/) — Telegram Bot Framework
- [@grammyjs/conversations](https://grammy.dev/plugins/conversations) — Conversation flows
- [@grammyjs/runner](https://grammy.dev/plugins/runner) — Concurrent update processing
- [@grammyjs/menu](https://grammy.dev/plugins/menu) — Inline menus
- [@grammyjs/ratelimiter](https://grammy.dev/plugins/ratelimiter) — Rate limiting
- [Zod](https://zod.dev/) — Environment validation
- Node.js built-in `node:sqlite` — Database

## Credits

Developed by **Rodroid Mods**

- Bot: [@rodroidbugreporter_bot](https://t.me/rodroidbugreporter_bot)
- Telegram Channel: [Join](https://t.me/+WmudnO0-xoNhMDQ8)
- Telegram Group: [Join](https://t.me/+QylrYL1GNsJiYjc0)

## License

ISC
