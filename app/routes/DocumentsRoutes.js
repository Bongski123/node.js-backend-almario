const bodyParser = require('body-parser');
const express = require('express');
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();
const app = express();
const bcrypt =require('bcrypt');
const jwt =require ('jsonwebtoken');
const config = require('../middleware/config');
const secretKey = config.secretKey;
const path = require('path'); // Import the path module
const cors = require('cors');
const fs = require('fs'); // Import the fs module
app.use(cors());

app.use(bodyParser.json());

const db = require('../config/database');



//DOCUMENT REGISTRY

router.post('/DocuReg', async (req, res) =>{

    try {

        const {document_name, document_type, project_id} = req.body;
        

        const insertDocumentQuery = 'INSERT INTO documents (document_name, document_type,project_id) VALUES (?, ?, ?)';
        await db.promise().execute(insertDocumentQuery,[document_name, document_type, project_id]);

        res.status(201).json({ message: 'Document registered succesfully'});
    } catch (error) {

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Username is already used'});
    }
})



//GET ALL THE DOCUMENTS
router.get('/researches', (req, res) => {

    try {

        db.query(`
        SELECT
        d.researches_id,
        d.title,
        d.author,
        d.publish_date,
        d.abstract,
        d.file_name,
        dep.department_name,
        cat.category_name
    FROM
        researches d
    JOIN
        departments dep ON d.department_id = dep.department_id
    JOIN
        categories cat ON d.category_id = cat.category_id;`, (err , result)=> {
            
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

//GET DETAILS OF 1 Document
router.get('/document/:id', authenticateToken, (req, res)=> {
    let document_id =req.params.id;
    if(!document_id){
        return res.status(400).send({ error: true, message: 'Please provide document_id'});
    }

    try{

        db.query('SELECT document_id, document_name, document_type , upload_date,project_id FROM documents  WHERE document_id = ?', document_id, (err, result)=>{

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


// Assuming db is your database connection
router.get('/pdf/:file_name', (req, res) => {
    try {
        const file_name = req.params.file_name;

        // Query the database to find the research by file name
        db.query('SELECT * FROM researches WHERE file_name = ?', [file_name], (err, results) => {
            if (err) {
                console.error('Error querying database:', err);
                return res.status(500).send('Error querying database');
            }

            if (results.length === 0) {
                return res.status(404).send('Research not found');
            }

            // Assuming the file names are stored without extensions
            const filePath = path.join(__dirname, '..', '..', 'public', 'pdfs', file_name + '.pdf');

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return res.status(404).send('PDF file not found');
                    }
                    console.error('Error reading file:', err);
                    return res.status(500).send('Error reading PDF file');
                }

                // Send the PDF file as response
                res.contentType("application/pdf");
                res.send(data);
            });
        });
    } catch (error) {
        console.error('Error fetching PDF:', error);
        res.status(500).send('Error fetching PDF. Please try again later.');
    }
});





//UPDATE document
router.put('/docuUpdate/:id',  async(req, res)=>{

    let project_id =req.params.id;

    const {document_name, document_type} = req.body;


    if(!project_id || !document_name || !document_type ){
        return res.status(400).send({ error: user , message: 'Please provide name, username and password'});
    }

    try{
        db.query('UPDATE documents SET document_name = ? , document_type =? WHERE document_id =?', [document_name, document_type, project_id],(err, result, field) =>{

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

//DELETE document
router.delete('/documentdelete/:id', authenticateToken, (req, res) => {
    let document_id = req.params.id;

    if( !document_id){
        return res.status(400).send({ error: true , message: 'Please provide user_id'});
    }

    try {

        db.query('DELETE FROM documents WHERE document_id =?', document_id,(err, result, field)=>{
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