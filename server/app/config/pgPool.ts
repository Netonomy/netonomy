import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool();

export default pool;
