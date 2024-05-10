const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// middleware setup
app.use(cors(
  {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionsSuccessStatus: 200
  }
));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhgag9l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const blogsCollection = client.db("blogsBD").collection("blogs");

    // get all blogs
    app.get('/blogs', async (req, res) => {
      const filter = req.query.filter;
      let query = {};
      if (filter) query = { category: filter };
      const result = await blogsCollection.find(query).toArray();
      res.send(result);
    })

    // post blogs
    app.post('/blogs', async (req, res) => {
      const query = req.body;
      // console.log(query);
      const result = await blogsCollection.insertOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('assignment eleven server is running')
})

app.listen(port, () => {
  console.log(`Assignment eleven server running on port ${port}`);
})