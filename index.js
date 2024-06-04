const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT;
//middleware
app.use(cors());
app.use(express.json());

//jwt
const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.uri;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    // MY WORK
    //mongodb database
    const database = client.db("AdAura");
    const usersCollection = database.collection("users");
    const adsCollection = database.collection("ads");

    //verify JWT valid token middleware
    const verifyJWT = (req, res, next) => {
      // console.log("verifyJwt" ,req.headers.authorization)
      const authorization = req.headers.authorization;

      if (!authorization) {
        return res
          .status(401)
          .send({ error: true, message: "unauthorized access- 1" });
      }
      const token = authorization.split(" ")[1];
      // console.log(token)
      jwt.verify(token, process.env.Access_Token, (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .send({ error: true, message: "unauthorized access -2" });
        }
        req.decoded = decoded;

        next();
      });
    };

    //jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.Access_Token, {
        expiresIn: "1h",
      });
      console.log(token);
      res.send({ token });
    });
    //store user
    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
// get user
    app.get("/user/:email",verifyJWT,  async (req, res) => {
      const email = req.params.email
      // console.log(email)
      const query = { email: email};
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    //update user by id
    app.patch('/updateUser/:id',verifyJWT, async (req, res) => {
      const id = req.params.id
      const updateData = req.body
      // console.log(updateData)
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.updateOne(query, { $set: updateData });

      res.send(result);

    })
//store Ads
app.post("/ads" ,verifyJWT, async (req, res) => {
  const adData = req.body;
  console.log(adData);
  const result = await adsCollection.insertOne(adData);
  res.send(result);
});
//get ads my email
app.get('/ads/:email', verifyJWT,async (req,res)=>{
  const email = req.params.email
// console.log(email)
  const query = { CreateBy: email};
  const ads = await adsCollection.find(query).toArray()
  // console.log(ads)
  res.send(ads)
})
// delete selected ads by id
app.delete('/ads/:id', verifyJWT, async(req,res)=>{
  const id = req.params.id
  
  const query = { _id : new ObjectId(id)}
  const result = await adsCollection.deleteOne(query)
  res.send(result)
})

//get ads  by id
app.get('/updateAds/:id', verifyJWT,async (req,res)=>{
  const id = req.params.id
  const query = { _id : new ObjectId(id)}
  const ads = await adsCollection.findOne(query)
  console.log(ads)
  res.send(ads)
})

app.get('/ads', verifyJWT, async(req,res)=>{
  const result = await adsCollection.find().toArray()
  res.send(result)
})
app.patch('/updateAds/:id',verifyJWT, async (req, res) => {
  const id = req.params.id
  const updateData = req.body
  // console.log(updateData)
  const query = { _id: new ObjectId(id) }
  const result = await adsCollection.updateOne(query, { $set: updateData });

  res.send(result);

})


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("AdAura server!");
});

app.listen(port, () => {
  console.log(`Author - Raihan Jami Khan. Server: AdAura ${port}`);
});
