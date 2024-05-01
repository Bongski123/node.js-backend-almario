const bodyParser = require('body-parser');
const express = require('express');
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();
const app = express();
const bcrypt =require('bcrypt');
const jwt =require ('jsonwebtoken');
const config = require('../middleware/config');
const secretKey = config.secretKey;


const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

const db = require('../config/database');



router.post('/register', async (req, res) =>{

    try {

        const {firstName, lastName,password,email,role_id} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUsersQuery = 'INSERT INTO users (firstName,lastName,password,email,role_id) VALUES (?,?,?,?,?)';
        await db.promise().execute(insertUsersQuery,[firstName, lastName,hashedPassword,email,role_id]);

        res.status(201).json({ message: 'User registered succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Username is already used'});
    }



    });



router.post('/login', async(req, res)=>{

    try {
        const {email, password} = req.body;

        const getUserQuery = 'SELECT * FROM users WHERE email =?';
        const[row] = await db.promise().execute(getUserQuery,[email ]);

        if(row.length === 0){
            return res.status(401).json({Error: 'Invalid username or password'});
        }

        const user = row[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch){
            return res.status(401).json({error: 'Invalid username or password'});

        } 

        const token = jwt.sign({Id: user.user_id, email: user.email,}, secretKey,{ expiresIn: '24h'});

        res.status(200).json({token});

     

    } catch (error){
        console.error('Error logging in user!', error);
        res.status(500).json({ error: 'Internal Server Error'});

    }


});




//GET ALL THE USERS
router.get('/users',authenticateToken, (req, res) => {

    try {

        db.query('SELECT *FROM users INNER JOIN roles ON users.role_id = roles.role_id', (err , result)=> {
            
            if(err){
                console.error('Error fetching items:', err);
            }else{
                res.status(200).json(result);
            }
        });
    } catch(error){

        console.error('Error loading users:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

//GET DETAILS OF 1 USER
router.get('/user/:id', authenticateToken, (req, res)=> {
    let id =req.params.id;
    if(!id){
        return res.status(400).send({ error: true, message: 'Please provide user_id'});
    }

    try{

        db.query('SELECT id, name ,user_id,email,password,role_id FROM users  WHERE id = ?', id, (err, result)=>{

            if(err){
                console.error('Error fetcing items:', err);
                res.status(500).json({message: 'Internal Server Error'});
            }else{
                res.status(200).json(result);
            }
        });
    }catch (error){
        console.error('Error loading user:', error);
        res.status(200).json({ error: 'Internal Server Error'});
    }
});

//UPDATE USER
router.put('/user/:id',authenticateToken,async(req, res)=>{

    let id =req.params.id;

    const {name, user_id,email, password,role_id} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if(!id || !name || !user_id || !email || !password || !role_id){
        return res.status(400).send({ error: users, message: 'Please provide name, username and password'});
    }

    try{
        db.query('UPDATE users SET name = ? ,user_id =? ,email =?,password =? ,role_id = ? WHERE id =?', [name, user_id,email,hashedPassword,role_id, id],(err, result, field) =>{

          if(err){
            console.error('Error updating items:', err);
            res.status(500).json({ message: 'Internal Server Error'});
          } else{
            res.status(200).json(result);
          } 
        } );
    
    } catch(error){
        console.error('Error Loading User', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

//DELETE USER
router.delete('/user/:id',authenticateToken,  (req, res) => {
    let id = req.params.id;

    if( !id){
        return res.status(400).send({ error: true , message: 'Please provide user_id'});
    }

    try {

        db.query('DELETE FROM users WHERE id =?', id,(err, result, field)=>{
            if (err){
                console.error('Error Deleting item:');
                res.status(500).json({ message: 'Internal Server Error'});
            } else{
                res.status(200).json(result);
            }
        });
    }catch(error){
        console.error('Error loading users:',error);
        res.status(500).json({error: 'Internal Server Error'});
    }

   
});


module.exports = router;
