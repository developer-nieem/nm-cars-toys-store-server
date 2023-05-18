const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
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

    app.post("/add-toys", async (req, res) => {
      const data = req.body;
      data.createTime = new Date();
      if (!data) {
        return res.status(404).send({ message: "error" });
      }
      const result = await carToysCollection.insertOne(data);
      res.send(result);
    });

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
