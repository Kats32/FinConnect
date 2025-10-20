import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",          
  host: "localhost",         
  database: "finconnect",    
  password: "pranathi10",  
  port: 5432,                
});