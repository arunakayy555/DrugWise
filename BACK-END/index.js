/*Purpose of index.js

Think of index.js as the main entry point of your backend server.

Starts your Express server

Loads middleware (CORS, JSON parsing)

Defines routes (/drugs, /interactions)

Connects to the database via your db.js (using db or execQuery)

Listens on a port (from .env)

Basically, it ties everything together.*/

import express from "express";
import cors from "cors";
import {config} from './common/configs.js';
import { db, execQuery } from './common/db.js';

const app=express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("DRUG INTERACTION CHECKER API running successfully!");
});


/*app.get("/drugs", async (req, res) => {
  try {
    const query = req.query.q || ""; 
    const result = await execQuery("SELECT * FROM drugs WHERE name ILIKE $1",
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /drugs route:", err.message);
    res.status(500).json({error: "Server Error"});
  }
});*/
app.get("/drugs", async (req, res) => {
  try {
    const query = req.query.q || "";
    console.log("Querying drugs with:", query); // <-- add this
    const result = await execQuery(
      "SELECT * FROM drugs WHERE name ILIKE $1",
      [`%${query}%`]
    );
    console.log("Result rows:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /drugs route:", err.message, err.stack); // <-- show full stack
    res.status(500).json({ error: "Server Error" });
  }
});


app.post("/interactions", async (req, res) => {
  const { drugs } = req.body; // expecting { "drugs": [1, 3] }

  try {
    const interactions = [];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const result = await execQuery(
          `SELECT * FROM interactions
           WHERE (drug1_id=$1 AND drug2_id=$2)
              OR (drug1_id=$2 AND drug2_id=$1)`,
          [drugs[i], drugs[j]]
        );
        if (result.rows.length > 0) {
          interactions.push(...result.rows);
        }     
      }
    }
    // remove duplicates by id before sending
/*const uniqueInteractions = Array.from(
  new Map(interactions.map(i => [i.id, i])).values()
);*/
const uniqueInteractions = Array.from(
  new Map(
    interactions.map(i => {
      const pairKey = [i.drug1_id, i.drug2_id].sort().join("-");
      return [pairKey, i];
    })
  ).values()
);

res.json(uniqueInteractions);
  } catch (err) {
    console.error("Error in /interactions route:", err.message);
    res.status(500).json({error: "Error checking interactions"});
  }
});

app.get("/interactions", async (req, res) => {
  try {
    const result = await execQuery("SELECT * FROM interactions");
    console.log("GET /interactions result:", result);
    res.json(result.rows);  // <-- maybe this should just be result
  } catch (err) {
    console.error("Error in /interactions GET route:", err.message);
    res.status(500).json({error: "server error"});
  }
});



app.listen(config.port,()=>{
     console.log(`server running on port http://localhost:${config.port}`)
});


/*
why do we add try catch despite having an execQuery?
-execQuery catches errors from the database query, logs them, and then throws them again (throw err)
-This means the error bubbles up to the caller (your route)
-If execQuery throws an error, it will crash your server unless the route catches it.

-The route’s try/catch allows you to:

-Send a proper HTTP response (500) to the frontend
-Prevent the server from crashing
-Optionally log or handle the error differently

1/execQuery handles DB-level errors and logs them

2/Route-level try/catch handles application-level errors and lets you respond gracefully to the client
*/