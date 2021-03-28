const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hyr5u.mongodb.net/brujAlArab?retryWrites=true&w=majority`;
const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());


const serviceAccount = require("./config/burj-al-arab-f77c6-firebase-adminsdk-hzbf1-e4ad7bbdf4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("brujAlArab").collection("bookings");
 
  app.post('/addBooking', (req, res)=>{
    const newBooking = req.body;
    collection.insertOne(newBooking)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
   
  })
  app.get('/bookings', (req, res) =>{
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)
      .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if(tokenEmail == queryEmail){
              collection.find({email: queryEmail})
              .toArray((error, documents) => {
                res.status(200).send(documents);
              })
          }
          else{
            res.status(401).send('un authorized access')
          }
        })
      .catch((error) => {
        res.status(401).send('un authorized access')
      });
    }
    else{
        res.status(401).send('un authorized access')
    }
    
  })

});

app.listen(port);