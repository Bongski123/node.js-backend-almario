
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nfcnexus',

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




















