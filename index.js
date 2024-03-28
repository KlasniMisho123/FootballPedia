import path from 'path';
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const APIkey = 'a660bc0ea58131fa93415e4bc72b8c5a5e72fd9415ae13b36205682015d5f626';

/*sign up on  https://apiv3.apifootball.com to get APIkey*/

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))

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

    const result = await axios.get(`https://apiv3.apifootball.com/?action=get_teams&league_id=302&APIkey=${APIkey}`);
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

 /* currently works on spain only, league id- ideas */

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});