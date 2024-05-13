const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, serialize, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// middleware setup
app.use(cors(
  {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }
));
app.use(express.json());
app.use(cookieParser())

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};


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
    const commentCollection = client.db("blogsBD").collection("comment");



    // jwt related api
    app.post('/jwt', async(req, res) => {
      const user = req.body;
      console.log("token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'});
      res.cookie('token', token, cookieOptions).send({success: true});
    })


    // get all blogs
    app.get('/blogs', async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    })

    app.get('/blogs/:id', async(req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await blogsCollection.findOne(query);
      res.send(result);
    })

    app.get('/all-blogs', async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        title: {$regex: search, $options: 'i'}
      };
      if (filter) query = {...query, category: filter };
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

    // comments related API
    app.post('/comment', async(req, res) => {
      const comment = req.body;
      // console.log(comment);
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    })

    app.get("/comment/:blogId", async (req, res)=>{
      // console.log(req.params.email)
      const query = { blogId: req.params.blogId };
      // console.log(query);
      const result = await commentCollection.find(query).toArray();
      res.send(result);
    })

    // Update blog
    app.put('/updateBlog/:id', async(req, res) => {
      const blogsDta = req.body;
      const query = {_id: new ObjectId(req.params.id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...blogsDta,
        }
      }
      const result = await blogsCollection.updateOne(query, updateDoc, options);
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