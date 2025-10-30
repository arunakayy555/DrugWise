import pg from 'pg';
const { Pool }=pg;

import {config} from './configs.js'

const db=new Pool({
    connectionString:config.databaseUrl,
    ssl:{
        rejectUnauthorized: false
    }
});
async function execQuery(text,params=[]){
    try{
        const results=await db.query(text,params);
        //we're just returning result-to print it w add things in index.js, add individual try catch for each route
        return results;
    }
    catch(err){
        console.error('query error:',err.message);
        throw err;
    }
}

export {db,execQuery};