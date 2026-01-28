const pg =require('pg');
const dotenv=require('dotenv').config();


const pgClient = new pg.Client({
  user:process.env.PGUSERNAME,
  password: process.env.PGPASS,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database:process.env.PGDATABASE,
})

module.exports = pgClient;
