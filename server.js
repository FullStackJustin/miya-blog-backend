const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// const path = require('path');

const corsOptions = {
  origin: ['http://localhost:3000'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// app.use(express.json())
// app.use(express.static(path.join(__dirname, "build")))
// app.use(express.urlencoded({ extended: true }))
// app.get('*', (req, res)=>{
  //   res.sendFile(path.join(__dirname, 'build/index.html'));
  // });

  app.listen(3002, () => {
  // console.log(JSON.parse(process.env.FIREBASE_KEY_JSON))
  console.log('Server listening on port 3002');
});
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);
initializeApp({
  credential: cert(serviceAccount),
})
const db = getFirestore();

app.post("/posts", async (req, res) => {
  try {
    console.log(req.body)
    const id = req.body.title;
    const postInfo = {
      title: req.body.title,
      postMessage: req.body.postMessage,
      date: req.body.date,
      tags: req.body.tags,
      type: req.body.type,
      image: req.body.image,
    }
    const docRef = await db.collection('posts').doc(id).set(postInfo);
      res.send(docRef)
      } catch (err) {
        console.log(err);
    }
})

app.get("/posts/all", async (req, res) => {
  try{
    const postsRef = db.collection("posts");
    const response = await postsRef.get();
    let responseArr = [];
    response.forEach(doc => {
      responseArr.push(doc.data('posts'));
    });
    res.send(responseArr);
  } catch(err) {
    res.send(err);
  }
})

app.get("/posts/books", async (req,res) => {
  try{
    const postRef = db.collection("posts");
    // Use the where method to filter the documents by the "type" field
    const querySnapshot = await postRef.where("type", "==", "book").get();

    // Get an array of documents from the query snapshot
    const posts = querySnapshot.docs.map(doc => doc.data());

    // Send the array of documents as the response
    res.send(posts);
  } catch(err){
    res.send(err);
  }
})

app.get("/posts/films", async(req, res) => {
  try{
    const postRef= db.collection("posts");
    const querySnapshot = await postRef.where("type", "==", "film").get();
    const posts = querySnapshot.docs.map(doc => doc.data());
    res.send(posts);
  } catch (err) {
    res.send(err);
  }
})

app.post("/posts/update", async(req, res) => {
  try{
    const id = req.body.title;
    const newPostInfo = {
      newMessage : req.body.postMessage,
      newTitle : req.body.title,
      newDate : req.body.date
    }
    const newPostRef = await db.collection("posts").doc(id).update(newPostInfo)
    res.send(newPostRef)
  } catch(err){
    res.send(err)
  }
})
app.delete("/posts", async(req, res) => {
  const id = req.body.id;
  try{
    const response = await db.collection("posts").doc(id).delete()
    res.send(response)
  }catch(err){
    if (err.code === 404){
      res.status(404).send("Sorry, the post was not found")
    } else {
      res.status(500).send("Sorry, an error occurred while deleting the post")
    }
  }
})

