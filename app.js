const express = require('express') //3rd party pkg from npm website
const {open} = require('sqlite') //3rd party pkg from npm website
const sqlite3 = require('sqlite3') //3rd party pkg from npm website
const path = require('path') // core modules or inbuild node js file

const app = express() // server instance created
app.use(express.json()) // recognise JSON format
const dpPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started at URL: http://localhost:3000')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//url: http://localhost:3000
//API-1: Returns a list of all players in the team --> Path: /players/
app.get('/players/', async (request, response) => {
  const listOfPlayersQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;
  `
  const listOfPlayer = await db.all(listOfPlayersQuery)
  response.send(listOfPlayer)
})

//API-2: Creates a new player in the team (database). player_id is auto-incremented --> Path: /players/
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
    INSERT INTO cricket_team
      (player_name, jersey_number, role)
    VALUES 
      (${playerName}, ${jerseyNumber}, ${role});`
  const newPlayer = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API-3: Returns a player based on a player ID --> Path: /players/:playerId/
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const specificPlayerExtractQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};   
  `
  const specificPlayer = await db.get(specificPlayerExtractQuery)
  response.send(specificPlayer)
})

//API-4: Updates the details of a player in the team (database) based on the player ID --> Path: /players/:playerId/
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const playerUpdateQuery = `
    UPDATE cricket_team
    SET 
      player_name = ${playerName},
      jersey_number = ${jerseyNumber},
      role = ${role}
    WHERE player_id = ${playerId};  
  `
  const playerUpdate = await db.run(playerUpdateQuery)
  response.send('Player Details Updated')
})

//API-5: Deletes a player from the team (database) based on the player ID --> Path: /players/:playerId/
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDeleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};  
  `
  const playerDelete = await db.run(playerDeleteQuery)
  response.send('Player Removed')
})

module.exports = app
