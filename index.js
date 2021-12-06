const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT ||  5000 

// middlewere 
app.use(cors())


// server setup
app.get('/', (req, res) => {
    res.send('Inacare Health Service Server Running..!')
  })
  
  app.listen(port, () => {
    console.log(`listening at ${port}`)
  })


  // database connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1yfcy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){

    try{
        await client.connect()
        console.log('Database Connected Successfully')
    }
    finally{
        // await client.close()
    }

}

run().catch(console.dir)


