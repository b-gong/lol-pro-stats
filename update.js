const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require('fs');


const playerDataRaw = fs.readFileSync('2021_players.json'); // get info about all the players i have to find
const playerData = JSON.parse(playerDataRaw); // store that info into JSON

const playerStats = JSON.parse(fs.readFileSync('playerStats.json')); // load statistics to update

const year = "2021";

updateAllData(playerData, playerStats).then(result => { // recieve updated playerStats
  writeData = JSON.stringify(result, null, 2); // convert updated playerStats to formatted string to write to file
  fs.writeFileSync('playerStats.json', writeData);
});

async function updateAllData(pData, pStats) {
  var promises = [];
  for(teamName in pData.teams) { // gives key of each element because pData.teams is a nested JSON
    for(playerIndex in pData.teams[teamName]) { // gives index of each element because pData.teams[teamName] is an array
      playerName = pData.teams[teamName][playerIndex] // get name of player from the index
      promises.push(getPlayerData(playerName, teamName, year)); // push asynchronous gamepedia requests to an array
    }
  }
  results = await Promise.allSettled(promises); // run all the requests and wait for all requests to complete
  results.forEach((result) => { // for each request, store the info into output json
    result = result.value;
    stats = result[0];
    team = result[1];
    name = result[2];
    pStats[team][name] = stats;
  });
  return pStats;
}

async function getPlayerData(player, team, year) {
  // get html info and prepare for parsing
  // will have to change if website permalink formatting changes
  const result = await request.get("https://lol.fandom.com/Special:RunQuery/TournamentStatistics?TS%5Bpreload%5D=ByPlayer&TS%5Bspl%5D=Yes&TS%5Blink%5D=" + player + "&TS%5Byear%5D=" + year + "&pfRunQueryFormName=TournamentStatistics");
  //const result = await request.get("https://lol.fandom.com/Special:RunQuery/TournamentStatistics?TS%5Bpreload%5D=ByPlayer&TS%5Bspl%5D=Yes&TS%5Blink%5D=" + player + "&TS%5Bteam%5D=" + team + "&TS%5Byear%5D=" + year + "&pfRunQueryFormName=TournamentStatistics");
  const $ = cheerio.load(result);

  var data = []; // used to hold label-less values from website table

  // will have to change if website html changes
  $(".wikitable > tbody > tr > td").each((index, element) => { // locate and get raw table data from lol.gamepedia player pages
    data.push($(element).text());
  });

  // will have to change if website html changes
  for(var i = 0; i < 7; i++) data.shift(); // cut away useless elements at the front

  // will have to change labels if table formatting changes
  let dataJson = { // store player data into json
    "games":data[0],
    "wins":data[1],
    "losses":data[2],
    "wr":data[3],
    "kills":data[4],
    "deaths":data[5],
    "assists":data[6],
    "kda":data[7],
    "cs":data[8],
    "csm":data[9],
    "gold":data[10],
    "goldm":data[11],
    "killpar":data[12],
    "killshare":data[13],
    "goldshare":data[14],
    "champs":data[15],
  }

  console.log(team + " " + player);

  return [dataJson, team, player];
}
