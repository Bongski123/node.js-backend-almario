
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6701897',
    password: 'QGzqtCmgyN',
    database: 'sql6701897',

});
  
//Database Notify
db.getConnection((err) =>  {

  if (err) {
      console.error('Error connecting to MySQL:', err);

  }else {
      console.log('Connected to  MySQL');
  }
});


module.exports = db;




















