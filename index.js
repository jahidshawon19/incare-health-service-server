const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT ||  5000 


// MIDDLEWRER HERE
app.use(cors())
app.use(express.json())


// server setup + database connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1yfcy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){

    try{
        await client.connect()

        const database = client.db('incare_health')
        const appointmentCollection = database.collection('appointments')


        //  POST API FOR APPOINTMENTS 

        app.post('/appointments', async(req, res) =>{

          const appointment = req.body 
          const result = await appointmentCollection.insertOne(appointment)
          res.json(result)
          
        })


        // GET APPOINTMENTS OF SPECIFIC USER BASED ON EMAIL

        app.get('/appointments', async(req, res) =>{
          const email = req.query.email 
          const query = {email:email}
          const cursor = appointmentCollection.find({query})
          const appointments = await cursor.toArray()
          res.json(appointments)

        })
  


    }
    finally{
        // await client.close()
    }

}

run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Inacare Health Service Server Running..!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})