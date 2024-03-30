import path from 'path';
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { error } from 'console';

const app = express();
const port = 3000;

const APIkey = 'a660bc0ea58131fa93415e4bc72b8c5a5e72fd9415ae13b36205682015d5f626';

/*sign up on  https://apiv3.apifootball.com to get APIkey*/

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))

app.set('view engine', 'ejs');


app.get("/", async (req, res) => {
  try{
    res.render("index.ejs", {
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/teams", async (req,res) =>{
  try {
    res.render("teams.ejs")
  } catch(error) {

  }
});

app.post("/teams", async (req, res) => {
  try {
    const selectedTeam = req.body.teamName;
    const selectedLeague =req.body.leagueName;

    const resultId = await axios.get(`https://apiv3.apifootball.com/?action=get_leagues&APIkey=${APIkey}`)
    const leagueIdData = resultId.data
    const selectedLeagueData = leagueIdData.find(league => league.league_name.toLowerCase().replace(" ","") === selectedLeague.toLowerCase().replace(" ",""))
    const selectedId = selectedLeagueData.league_id
    console.log(selectedId)

    const result = await axios.get(`https://apiv3.apifootball.com/?action=get_teams&league_id=${selectedId}&APIkey=${APIkey}`);
    const teamsData = result.data;

    const selectedTeamData = teamsData.find(team => team.team_name.toLowerCase().replace(" ","") === selectedTeam.toLowerCase().replace(" ",""))

    const teamInfo = {
      teamName: selectedTeamData.team_name,
      teamBadge: selectedTeamData.team_badge,
      country: selectedTeamData.team_country,
      founded: selectedTeamData.team_founded,
      stadium: selectedTeamData.venue.venue_name
    };

    const playerList = [];

    selectedTeamData.players.forEach(player => {
      playerList.push( { 
        name: player.player_name,
        number: player.player_number,
        position: player.player_type,
        age: player.player_age
      })
    });

    res.render("teams.ejs", { 
      teamInfo: teamInfo,
      teamPlayers: playerList
    }); 
  } catch (error) {
    console.error("Error:", error);
    res.render("teams.ejs");
  }
});

app.get('/players', async (req, res) => {
  try {
    res.render('player.ejs', { 
      player_img : "",
      team_img: "",
      playerInfo: "",
      playerSeason: ""
    })
  } catch (error) {

      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/players', async (req, res) => {
  try {
  const playerName = req.body.playerName[0] + "." + " " + req.body.playerSurname;

  const connection = await axios.get(`https://apiv3.apifootball.com/?action=get_players&player_name=${playerName}&APIkey=${APIkey}`)

  const playerData = connection.data[0]
  const currentTeamId = playerData.team_key; 
  
  const getTeam = await axios.get(`https://apiv3.apifootball.com/?action=get_teams&team_id=${currentTeamId}&APIkey=${APIkey}`)

  const getTeamData = getTeam.data[0];

  const teamImg = getTeamData.team_badge;
  

  const playerInfo = {
    playerName: playerData.player_name,
    number: playerData.player_number,
    position: playerData.player_type,
    playerAge: playerData.player_age
  };

  const playerSeason = {
    team: playerData.team_name,
    matches: playerData.player_match_played,
    goals: playerData.player_goals,
    assists: playerData.player_assists,
    minutes: playerData.player_minutes,
    injured: `Injured status: ${playerData.player_injured}`
  };

    res.render('player.ejs', { 
      player_img : playerData.player_image,
      team_img: teamImg,
      playerInfo: playerInfo,
      playerSeason: playerSeason
    });
  } catch (error) {

    res.render('player.ejs', { 
      player_img : "",
      team_img: "",
      playerInfo: "",
      playerSeason: ""
    }
  )}
});

app.get("/topscorers", async (req,res) => {
try{

res.render("topscorer.ejs",{
})  
}catch(erro) {
  console.log("error:", error);
}
});

app.post("/topscorers", async (req,res) => {
  try{
  const leagueId = await axios.get(`https://apiv3.apifootball.com/?action=get_leagues&APIkey=${APIkey}`);
  const leagueIdData = leagueId.data
  const selectedLeague = req.body.leagueName
  const selectedLeagueData = leagueIdData.find(league => league.league_name.toLowerCase().replace(" ","") === selectedLeague.toLowerCase().replace(" ","").replace("-",""))
  const selectedLeagueId = selectedLeagueData.league_id;

  const conn = await axios.get(`https://apiv3.apifootball.com/?action=get_topscorers&league_id=${selectedLeagueId}&APIkey=${APIkey}`);

  const topScorersData = conn.data

  const top10scorer = topScorersData.slice(0, 10);

  top10scorer
  
  res.render("topscorer.ejs",{
    countryFlag: selectedLeagueData.country_logo,
    leagueLogo: selectedLeagueData.league_logo,
    top10scorer: top10scorer
  })  
  }catch(erro) {
    res.render("topscorer.ejs")
  }
  });

app.get("/test", async (req, res) => {
})

app.get("/standings", async (req,res) => {
  res.render("standings.ejs")
})

app.post("/standings", async (req,res) => {
  try {
    const leagues = await axios.get(`https://apiv3.apifootball.com/?action=get_leagues&APIkey=${APIkey}`); 
    const leaguesData = leagues.data

    const selectedLeague = req.body.leagueName

    const selectedleagues = leaguesData.find(league => league.league_name.toLowerCase().replace(" ","") === selectedLeague.toLowerCase().replace(" ","").replace("-",""))

    const leagueId = selectedleagues.league_id

    const standings = await axios.get(`https://apiv3.apifootball.com/?action=get_standings&league_id=${leagueId}&APIkey=${APIkey}`);

    const standingsData = standings.data

    res.render("standings.ejs", {
      standings: standingsData
    })
  } catch(error) {
    
   res.render("standings.ejs") 

  }
});



app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});