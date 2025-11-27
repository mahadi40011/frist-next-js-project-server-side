const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is Running");
});

const uri = process.env.URI

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

    const database = client.db("FirstNextJS_DB");
    const ProductCollection = database.collection("Products");

    // post a data
    app.post("/add-product", async (req, res) => {
      const newTransaction = req.body;
      const result = await ProductCollection.insertOne(newTransaction);
      res.send(result);
    });

    // get all data
    app.get("/products", async (req, res) => {
      const expectedFields = {
        imageUrl: 1,
        title: 1,
        shortDesc: 1,
        price: 1,
      };
      let cursor = ProductCollection.find().project(expectedFields);
      const result = await cursor.toArray();
      res.send(result);
    });

    //manage all data
    app.get("/manage-products", async (req, res) => {
      const expectedFields = {
        date: 1,
        title: 1,
        priority: 1,
        price: 1,
      };
      let cursor = ProductCollection.find()
        .sort({ date: -1 })
        .project(expectedFields);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single data
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.findOne(query);

      if (!result) {
        return res
          .status(404)
          .send({ message: "Transaction not found or unauthorized" });
      }

      res.send(result);
    });

    //latest products
    app.get("/latest-products", async (req, res) => {
      try {
        const expectedFields = {
          imageUrl: 1,
          title: 1,
          shortDesc: 1,
          price: 1,
        };
        const products = await ProductCollection.find({})
          .project(expectedFields)
          .sort({ date: -1 }) 
          .limit(8)
          .toArray();
        res.json(products);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // delete a data
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
