const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xifd9dy.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const carToysCollection = client.db("carToysDB").collection("carToys");

    const indexKey =  {toysName : 1};
    const indexOption =  {name : 'toyName'};
    const result =  await carToysCollection.createIndex(indexKey, indexOption);

    // search by toys

    app.get('/toyssearch/:text' , async(req, res) =>{
        const text = req.params.text;
        // console.log(text);
        const result =  await carToysCollection.find({
            $or : [
                {toysName : {$regex: text , $options: 'i'}}
            ]
        }).toArray()

        // console.log(result);
        res.send(result)
    })


    // post car toys 
    app.post("/add-toys", async (req, res) => {
      const data = req.body;
      data.createTime = new Date();
      if (!data) {
        return res.status(404).send({ message: "error" });
      }
      const result = await carToysCollection.insertOne(data);
      res.send(result);
    });


    // toys information with sub-category
    app.get("/toys/:text", async (req, res) => {
      const text = req.params.text;

      if (text == "sportsCar" || text == "truck" || text == "regularCar") {
        const result = await carToysCollection
          .find({ subCategory: text })
          .toArray();
        return res.send(result);
      } else {
        const result = await carToysCollection.find().toArray();
        res.send(result);
      }
    });

    // toys details with ID
    app.get("/toysdetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await carToysCollection.findOne(filter);
      res.send(result);
    });

    // finding toys with email
    app.get("/mytoys/:email", async (req, res) => {
      const mail = req.params.email;
      // console.log(mail);
      // const filter =  {sellerEmail : new ObjectId(mail)}
      const result = await carToysCollection
        .find({ sellerEmail: mail })
        .toArray();
      
      res.send(result);
    });

    // toys find with ID  for update toys
    app.get("/updatedetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await carToysCollection.findOne(filter);
      res.send(result);
    });


    // updated toys 
    app.put("/updatetoys/:id", async (req, res) => {
      const id = req.params.id;
      
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          toysName: body.toysName,
          sellerName: body.sellerName,
          sellerEmail: body.sellerEmail,
          photo: body.photo,
          quantity: body.quantity,
          rating: body.rating,
          details: body.details,
          price: body.price,
        },
      };
      const result = await carToysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // Delete toys 
    app.delete('/deletetoy/:id' , async(req,res) =>{
        const id =  req.params.id;
        const filter =  {_id : new ObjectId(id)};
        const result =  await carToysCollection.deleteOne(filter);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("nm car toys is open");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
