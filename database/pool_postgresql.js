const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = new Pool({connectionString: process.env.POSTGRESQL_URL});
// let pool = "";
// pool.on(`connect`, () => {
//    console.log(`connected to the db`);
// });

//try {
const pool = new Pool({
    //운영
    connectionString:  "postgresql://owner:!ghkwn_20@172.21.1.199:5432/owner",
    //개발
    // connectionString:  "postgresql://owner:!ghkwn_20@172.19.1.22:5432/owner",
    max: 30,
    min: 10,
    idleTimeoutMillis: 60000, 
    connectionTimeoutMillis: 60000, 
    statementTimeoutMillis: 30000, 
    keepAlive:true 
});


console.log("postgresql pool creating...");
//}catch(err){
//    console.error('init error: ' + err.message);
//}
  


module.exports = pool;