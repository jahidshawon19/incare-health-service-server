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
        const usersCollection = database.collection('users')
        



        //  POST API FOR APPOINTMENTS 

        app.post('/appointments', async (req, res) =>{

          const appointment = req.body 
          const result = await appointmentCollection.insertOne(appointment)
          res.json(result)
          
        })


        // GET APPOINTMENTS OF SPECIFIC USER BASED ON EMAIL

        app.get('/appointments', async (req, res) =>{
          const email = req.query.email 
          const query = {email:email}
          const cursor = appointmentCollection.find(query)
          const appointments = await cursor.toArray()
          res.json(appointments)

        })


        // POST API FOR USERS 

        app.post('/users', async(req, res) => {
          const users = req.body
          const result = await usersCollection.insertOne(users)
          res.json(result)
        })

        // PUT API FOR USERS THOSE ARE FROM SIGN IN WITH GOOGLE

        app.put('/users', async (req, res) =>{
          const user = req.body 
          
          const filter = { email: user.email }
          const options = { upsert:true }
          const updateDoc = { $set: user}
          const result = await usersCollection.updateOne(filter, updateDoc, options)
          res.json(result)
        })
  
        // PUT API FOR USERS THOSE WANT TO BECOME ADMIN

        app.put('/users/admin', async (req, res) =>{
          
          const user = req.body 
          console.log('put', user)
          const filter = { email: user.email}
          const updateDoc = { $set: {role: 'admin'} }
          const result = await usersCollection.updateOne(filter, updateDoc)
         
          res.json(result)
        })


        // GET API TO GET ONLY ADMIN USER BY EMAIL

        app.get('/users/:email', async (req, res) => {

          const email = req.params.email 
          const query = {email: email}
          const user = await usersCollection.findOne(query)
          let isAdmin = false 
          if(user?.role === 'admin'){
            isAdmin = true 
          }
          res.json({admin:isAdmin})
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