/**
 * Money on the Court - NBA Matchup Analyzer (Simplified)
 */

const CONFIG = {
    useRealAPI: true,
    apiBaseUrl: '/api',
    apiKey: ''
};

const NBA_TEAMS = {
    ATL: { name: 'Hawks', city: 'Atlanta', id: 1610612737 },
    BOS: { name: 'Celtics', city: 'Boston', id: 1610612738 },
    BKN: { name: 'Nets', city: 'Brooklyn', id: 1610612751 },
    CHA: { name: 'Hornets', city: 'Charlotte', id: 1610612766 },
    CHI: { name: 'Bulls', city: 'Chicago', id: 1610612741 },
    CLE: { name: 'Cavaliers', city: 'Cleveland', id: 1610612739 },
    DAL: { name: 'Mavericks', city: 'Dallas', id: 1610612742 },
    DEN: { name: 'Nuggets', city: 'Denver', id: 1610612743 },
    DET: { name: 'Pistons', city: 'Detroit', id: 1610612765 },
    GSW: { name: 'Warriors', city: 'Golden State', id: 1610612744 },
    HOU: { name: 'Rockets', city: 'Houston', id: 1610612745 },
    IND: { name: 'Pacers', city: 'Indiana', id: 1610612754 },
    LAC: { name: 'Clippers', city: 'LA', id: 1610612746 },
    LAL: { name: 'Lakers', city: 'Los Angeles', id: 1610612747 },
    MEM: { name: 'Grizzlies', city: 'Memphis', id: 1610612763 },
    MIA: { name: 'Heat', city: 'Miami', id: 1610612748 },
    MIL: { name: 'Bucks', city: 'Milwaukee', id: 1610612749 },
    MIN: { name: 'Timberwolves', city: 'Minnesota', id: 1610612750 },
    NOP: { name: 'Pelicans', city: 'New Orleans', id: 1610612740 },
    NYK: { name: 'Knicks', city: 'New York', id: 1610612752 },
    OKC: { name: 'Thunder', city: 'Oklahoma City', id: 1610612760 },
    ORL: { name: 'Magic', city: 'Orlando', id: 1610612753 },
    PHI: { name: 'Sixers', city: 'Philadelphia', id: 1610612755 },
    PHX: { name: 'Suns', city: 'Phoenix', id: 1610612756 },
    POR: { name: 'Trail Blazers', city: 'Portland', id: 1610612757 },
    SAC: { name: 'Kings', city: 'Sacramento', id: 1610612758 },
    SAS: { name: 'Spurs', city: 'San Antonio', id: 1610612759 },
    TOR: { name: 'Raptors', city: 'Toronto', id: 1610612761 },
    UTA: { name: 'Jazz', city: 'Utah', id: 1610612762 },
    WAS: { name: 'Wizards', city: 'Washington', id: 1610612764 }
};

function getTeamLogoUrl(abbr) {
    const team = NBA_TEAMS[abbr];
    return team ? 'https://cdn.nba.com/logos/nba/' + team.id + '/global/L/logo.svg' : '';
}

function generateSalary(tier) {
    const ranges = {
        superstar: { min: 40000000, max: 55000000 },
        star: { min: 25000000, max: 40000000 },
        starter: { min: 10000000, max: 25000000 },
        rotation: { min: 3000000, max: 10000000 },
        bench: { min: 1000000, max: 3000000 }
    };
    const range = ranges[tier] || ranges.bench;
    return Math.floor(Math.random() * (range.max - range.min) / 100000) * 100000 + range.min;
}

function generateStatus() {
    const r = Math.random();
    if (r < 0.70) return 'active';
    if (r < 0.80) return 'probable';
    if (r < 0.88) return 'questionable';
    if (r < 0.94) return 'doubtful';
    return 'out';
}

function generateRoster() {
    const positions = ['PG', 'SG', 'SF', 'PF', 'C', 'PG', 'SG', 'SF', 'PF', 'C', 'SG', 'SF'];
    const tiers = ['star', 'starter', 'starter', 'starter', 'starter', 'rotation', 'rotation', 'rotation', 'bench', 'bench', 'bench', 'bench'];
    return positions.map(function(pos, i) {
        return {
            name: 'Player ' + (i + 1),
            position: pos,
            tier: tiers[i],
            salary: generateSalary(tiers[i]),
            status: generateStatus()
        };
    });
}

function formatSalary(s) {
    return s >= 1000000 ? '$' + (s / 1000000).toFixed(1) + 'M' : '$' + (s / 1000).toFixed(0) + 'K';
}

function formatDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateISO(d) {
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function isToday(d) {
    var today = new Date();
    return d.toDateString() === today.toDateString();
}

var currentDate = new Date();
var games = [];

async function fetchGames(date) {
    var dateStr = formatDateISO(date);
    console.log('=== FETCHING GAMES ===');
    console.log('Date:', dateStr);

    try {
        var url = CONFIG.apiBaseUrl + '/games?dates[]=' + dateStr;
        console.log('URL:', url);

        var response = await fetch(url);
        console.log('Response status:', response.status);

        var data = await response.json();
        console.log('Data received, game count:', data.data ? data.data.length : 0);

        if (data.data && data.data.length > 0) {
            return data.data.map(function(game) {
                var awayAbbr = game.visitor_team.abbreviation;
                var homeAbbr = game.home_team.abbreviation;

                var status = 'scheduled';
                if (game.status === 'Final') status = 'final';
                else if (game.period > 0) status = 'live';

                var awayRoster = generateRoster();
                var homeRoster = generateRoster();

                var awayAvailable = awayRoster.filter(function(p) { return p.status !== 'out'; }).reduce(function(s, p) { return s + p.salary; }, 0);
                var homeAvailable = homeRoster.filter(function(p) { return p.status !== 'out'; }).reduce(function(s, p) { return s + p.salary; }, 0);
                var awayInjuries = awayRoster.filter(function(p) { return p.status === 'out' || p.status === 'doubtful'; }).length;
                var homeInjuries = homeRoster.filter(function(p) { return p.status === 'out' || p.status === 'doubtful'; }).length;

                return {
                    id: game.id,
                    status: status,
                    awayTeam: {
                        abbr: awayAbbr,
                        name: game.visitor_team.name,
                        city: game.visitor_team.city,
                        score: game.visitor_team_score || 0,
                        roster: awayRoster.sort(function(a, b) { return b.salary - a.salary; }),
                        availableSalary: awayAvailable,
                        injuries: awayInjuries
                    },
                    homeTeam: {
                        abbr: homeAbbr,
                        name: game.home_team.name,
                        city: game.home_team.city,
                        score: game.home_team_score || 0,
                        roster: homeRoster.sort(function(a, b) { return b.salary - a.salary; }),
                        availableSalary: homeAvailable,
                        injuries: homeInjuries
                    },
                    totalInjuries: awayInjuries + homeInjuries
                };
            });
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }

    console.log('No games found');
    return [];
}

function renderGames() {
    var container = document.getElementById('gamesContainer');
    container.innerHTML = '';

    if (games.length === 0) {
        container.innerHTML = '<div class="no-games"><h3>No Games</h3><p>No games scheduled for this date.</p></div>';
        return;
    }

    games.forEach(function(game) {
        var card = document.createElement('article');
        card.className = 'game-card';

        if (game.status === 'final') {
            var higherSalary = game.awayTeam.availableSalary > game.homeTeam.availableSalary ? 'away' : 'home';
            var winner = game.awayTeam.score > game.homeTeam.score ? 'away' : 'home';
            card.classList.add(higherSalary === winner ? 'money-won' : 'money-lost');
        }

        var statusClass = game.status;
        var statusText = game.status.charAt(0).toUpperCase() + game.status.slice(1);
        var scoreDisplay = game.status === 'scheduled' ? '@' : game.awayTeam.score + ' - ' + game.homeTeam.score;

        var totalSalary = game.awayTeam.availableSalary + game.homeTeam.availableSalary;
        var awayPct = (game.awayTeam.availableSalary / totalSalary) * 100;

        var injuryClass = game.totalInjuries >= 4 ? 'high' : game.totalInjuries >= 2 ? 'medium' : 'low';

        card.innerHTML = '<div class="game-header">' +
            '<div class="team away-team">' +
                '<img class="team-logo" src="' + getTeamLogoUrl(game.awayTeam.abbr) + '" alt="' + game.awayTeam.name + '">' +
                '<span class="team-abbr">' + game.awayTeam.abbr + '</span>' +
                '<span class="team-name">' + game.awayTeam.name + '</span>' +
            '</div>' +
            '<div class="game-info">' +
                '<span class="game-status ' + statusClass + '">' + statusText + '</span>' +
                '<span class="game-score">' + scoreDisplay + '</span>' +
            '</div>' +
            '<div class="team home-team">' +
                '<img class="team-logo" src="' + getTeamLogoUrl(game.homeTeam.abbr) + '" alt="' + game.homeTeam.name + '">' +
                '<span class="team-abbr">' + game.homeTeam.abbr + '</span>' +
                '<span class="team-name">' + game.homeTeam.name + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="game-summary">' +
            '<div class="summary-stat">' +
                '<span class="stat-label">Available Salary</span>' +
                '<div class="salary-comparison">' +
                    '<span class="away-salary">' + formatSalary(game.awayTeam.availableSalary) + '</span>' +
                    '<div class="salary-bar-container">' +
                        '<div class="salary-bar away-bar" style="width: ' + awayPct + '%"></div>' +
                        '<div class="salary-bar home-bar" style="width: ' + (100 - awayPct) + '%"></div>' +
                    '</div>' +
                    '<span class="home-salary">' + formatSalary(game.homeTeam.availableSalary) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="summary-stat injuries-summary">' +
                '<span class="stat-label">Key Injuries</span>' +
                '<span class="injuries-count ' + injuryClass + '">' + game.totalInjuries + ' player' + (game.totalInjuries !== 1 ? 's' : '') + ' out/doubtful</span>' +
            '</div>' +
        '</div>' +
        '<button class="expand-btn">' +
            '<span>View Rosters</span>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
        '</button>' +
        '<div class="game-details">' +
            '<div class="roster-container">' +
                '<div class="roster away-roster">' +
                    '<h3 class="roster-title">' + game.awayTeam.abbr + ' Roster</h3>' +
                    '<ul class="player-list">' + renderPlayerList(game.awayTeam.roster) + '</ul>' +
                '</div>' +
                '<div class="roster home-roster">' +
                    '<h3 class="roster-title">' + game.homeTeam.abbr + ' Roster</h3>' +
                    '<ul class="player-list">' + renderPlayerList(game.homeTeam.roster) + '</ul>' +
                '</div>' +
            '</div>' +
        '</div>';

        card.querySelector('.expand-btn').addEventListener('click', function() {
            card.classList.toggle('expanded');
        });

        container.appendChild(card);
    });
}

function renderPlayerList(roster) {
    return roster.map(function(p) {
        return '<li class="player-row ' + (p.status === 'out' ? 'out' : '') + '">' +
            '<div class="player-info">' +
                '<span class="player-status-dot ' + p.status + '"></span>' +
                '<span class="player-name">' + p.name + '</span>' +
                '<span class="player-position">' + p.position + '</span>' +
            '</div>' +
            '<div class="player-salary">' +
                '<span class="salary-value">' + formatSalary(p.salary) + '</span>' +
            '</div>' +
            '<span class="player-status-label ' + p.status + '">' + p.status.charAt(0).toUpperCase() + p.status.slice(1) + '</span>' +
        '</li>';
    }).join('');
}

function renderDateNav() {
    document.getElementById('dateLabel').textContent = isToday(currentDate) ? "Today's Games" : 'NBA Games';
    document.getElementById('dateValue').textContent = formatDate(currentDate);
}

async function loadGames() {
    var container = document.getElementById('gamesContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading games...</p></div>';

    renderDateNav();
    games = await fetchGames(currentDate);
    console.log('Games loaded:', games.length);
    renderGames();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== MONEY ON THE COURT STARTING ===');

    document.getElementById('prevDay').addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() - 1);
        loadGames();
    });

    document.getElementById('nextDay').addEventListener('click', function() {
        currentDate.setDate(currentDate.getDate() + 1);
        loadGames();
    });

    loadGames();
});
