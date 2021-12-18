const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT ||  5000 
const admin = require("firebase-admin");
const serviceAccount = require('./incare-health-firebase-adminsdk.json');
const ObjectId = require('mongodb').ObjectId

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// MIDDLEWRER HERE
app.use(cors())
app.use(express.json())



// incare-health-firebase-adminsdk.json









// server setup + database connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1yfcy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function verifyToken(req, res, next){
  if(req.headers.authorization.startsWith('Bearer ')){
    const token = req.headers.authorization.split(' ')[1]

    try{
      const decodedUser = await admin.auth().verifyIdToken(token)
      req.decodedEmail = decodedUser.email
    }
    catch{}
  }
  next()
}




async function run(){

    try{
        await client.connect()

        const database = client.db('incare_health')
        const appointmentCollection = database.collection('appointments')
        const usersCollection = database.collection('users')
        const servicesCollection = database.collection('services')
        const doctorsCollection = database.collection('doctors')
        



        // POST API FOR DOCTORS 

        app.post('/doctors', async (req, res) => {
          const doctor = req.body 
          const result = await doctorsCollection.insertOne(doctor)
          res.json(result)
        })


        // GET API FOR DOCTORS 

         app.get('/doctors', async (req,res) =>{
            const cursor = doctorsCollection.find({})
            const doctors = await cursor.toArray()
            res.send(doctors)
        })


        // GET API FOR DOCTOR DETAILS PAGE 

        app.get('/doctors/:id', async (req, res) =>{
          const id = req.params.id 
          const query = { _id: ObjectId(id) }
          const doctor = await doctorsCollection.findOne(query)
          res.send(doctor)
        })

        // POST API FOR SERVICES 
        app.post('/services', async (req,res) =>{
          const service = req.body 
          const result = await servicesCollection.insertOne(service)
          res.json(result)
        })

        // GET API FOR SERVICES 

        app.get('/services', async (req,res) =>{
          const cursor = servicesCollection.find({})
          const services = await cursor.toArray()
          res.send(services)
        })

        // GET API FOR SERVICE DETAILS 
        app.get('/services/:id', async (req, res) =>{
          const id = req.params.id 
          const query = { _id: ObjectId(id) }
          const service = await servicesCollection.findOne(query)
          res.send(service)
        })


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

        app.put('/users/admin', verifyToken, async (req, res) =>{
          
          const user = req.body 
          const requester = req.decodedEmail
          if(requester){
            const requesterAccount = await usersCollection.findOne({email:requester})
            if(requesterAccount.role === 'admin'){
              const filter = { email: user.email}
              const updateDoc = { $set: {role: 'admin'} }
              const result = await usersCollection.updateOne(filter, updateDoc)
             
              res.json(result)
            }
          }
          else{
            res.status(403).json({message:'Not Permission'})
          }

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