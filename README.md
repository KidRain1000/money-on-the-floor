# Money on the Floor

NBA Matchup Analyzer - Compare games by available player salaries. See which team has more "money on the floor" and track if that predicts winners.

**Live Demo:** https://money-on-the-floor.vercel.app

![Screenshot](https://cdn.nba.com/logos/nba/1610612737/global/L/logo.svg)

## Features

- **Real-time NBA games** - Today's schedule with live scores
- **Player salaries** - Real contract data from ESPN
- **Injury tracking** - Live injury reports (Out, Doubtful, Questionable)
- **Win/Loss indicators** - Green = higher salary team won, Red = upset
- **Mobile-friendly** - Works great on phones

## Quick Deploy (5 minutes)

### Option 1: Fork & Deploy to Vercel (Easiest)

1. **Fork this repo** - Click the "Fork" button on GitHub
2. **Go to [vercel.com](https://vercel.com)** - Sign up with your GitHub account
3. **Import your fork** - Click "New Project" → Select your forked repo
4. **Deploy** - Click "Deploy" and you're live!

That's it! Vercel handles everything automatically.

### Option 2: Run Locally

```bash
# Clone the repo
git clone https://github.com/KidRain1000/money-on-the-floor.git
cd money-on-the-floor

# Start local server
node server.js

# Open http://localhost:8080
```

## How It Works

The app pulls data from two sources:

1. **[balldontlie.io](https://balldontlie.io)** - NBA game schedules and scores
2. **ESPN Hidden API** - Player rosters, salaries, and injury reports

### API Keys

The app uses a free balldontlie.io API key. To get your own:

1. Go to https://balldontlie.io
2. Sign up for free
3. Copy your API key
4. Update it in `api/games.js` and `server.js`

## Project Structure

```
money-on-the-floor/
├── index.html      # Main page
├── styles.css      # Styling
├── app.js          # Frontend logic
├── server.js       # Local dev server
├── vercel.json     # Vercel config
└── api/
    ├── games.js    # Game data endpoint
    └── injuries.js # Roster/injury endpoint (ESPN)
```

## Customization Ideas

- Change the color scheme in `styles.css` (CSS variables at top)
- Add team records/standings
- Add betting odds integration
- Add historical win rate for "money on the floor" strategy
- Add player photos

## Tech Stack

- Vanilla JavaScript (no frameworks)
- Vercel Serverless Functions
- ESPN + balldontlie.io APIs

## Credits

Built by the crew. Original concept from [moneyonthefloor.live](https://www.moneyonthefloor.live/).

---

**Questions?** Open an issue on GitHub.
