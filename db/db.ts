import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",          
  host: "localhost",         
  database: "finconnect",    
  password: "munni123",  
  port: 5432,                
});