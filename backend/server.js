require("dotenv").config();

const express = require("express");
const cors = require("cors");

// const config = require("./config.json");
const mongoose = require("mongoose");

const app = express();

const jwt = require("jsonwebtoken");
const { authenticationToken } = require("./utilities");

app.use(express.json());

 const URI = process.env.MongoDBURI;
try {
    mongoose.connect(URI,{
         });
    console.log("Connected to mongoDB");
} catch (error) {
    console.log("Error: ", error);
}
 



const User = require("./models/user.model");
const Note = require("./models/note.model");

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", async (req, res) => {
  res.json("Hello World! This is a note taking app's server.");
});

// app.post("/create-user", async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;

//   if (!firstName || !lastName || !email || !password) {
//     return res
//       .status(400)
//       .json({ error: true, message: "Please fill in all fields." });
//   }

//   const isUser = await User.findOne({ email: email });

//   if (isUser) {
//     return res
//       .status(400)
//       .json({ error: true, message: "User already exists." });
//   }

//   const user = new User({ firstName, lastName, email, password });

//   await user.save();

//   const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "2h",
//   });

//   return res.json({
//     error: false,
//     user,
//     accessToken,
//     message: "User created successfully.",
//   });
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({error: true, message: "Please fill in all fields."});
//   }
//   const user = await User.findOne({email: email});

//   if(!user) {
//     return res.status(400).json({error: true, message: "User does not exist."});
//   }

//   if(user.password === password && user.email === email) {
//     const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "2h"});

//     return res.json({error: false, email, accessToken, message: "User logged in successfully."});
//   } else {
//     return res.status(400).json({error: true, message: "Invalid credentials."});
//   }
// });

app.post("/create-note", authenticationToken, async (req, res) => {
  const { title, content, tags, isPinned } = req.body;
  const {user} = req.user;

  if(!title || !content) {
    return res.status(400).json({error: true, message: "Please fill in all required fields."});
  }

  const note = new Note({
    title,
    content,
    tags,
    isPinned,
    userId: user._id,
  });

  await note.save();

  return res.json({error: false, note, message: "Note created successfully."});

});

app.post('/edit-note/:noteId', authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const {title, content, tags, isPinned} = req.body;
  const {user} = req.user;

  if(!title && !content && !tags) {
    return res.status(400).json({error: true, message: "No Changes made."});
  }

  const note = await Note.findById(noteId);

  if(!note) {
    return res.status(400).json({error: true, message: "Note not found."});
  }

  if(note.userId !== user._id) {
    return res.status(400).json({error: true, message: "Unauthorized."});
  }

  note.title = title || note.title;
  note.content = content || note.content;
  note.tags = tags || note.tags;
  note.isPinned = isPinned || note.isPinned;

  await note.save();

  return res.json({error: false, note, message: "Note updated successfully."});

});

app.get('/get-notes', authenticationToken, async (req, res) => {
  const {user} = req.user;

  if(!user) {
    return res.status(400).json({error: true, message: "User not found."});
  }

  const notes = await Note.find({userId: user._id}).sort({isPinned: -1, createdAt: -1});

  if(!notes) {
    return res.json({error: false, message: "No notes found."});
  }

  return res.json({error: false, notes, message: "Notes retrieved successfully."});
});

app.delete('/delete-note/:noteId', authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const {user} = req.user;

  const note = await Note.findById({_id:noteId, userId: user._id});

  if(!note) {
    return res.status(400).json({error: true, message: "Note not found."});
  }

  if(note.userId !== user._id) {
    return res.status(400).json({error: true, message: "Unauthorized."});
  }

  await Note.deleteOne({_id:noteId, userId: user._id});

  return res.json({error: false, message: "Note deleted successfully."});
});

app.put('/pin-note/:noteId', authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const {user} = req.user;

  const note = await Note.findById({_id: noteId, userId: user._id});

  if(!note) {
    return res.status(400).json({error: true, message: "Note not found."});
  }

  if(note.userId !== user._id) {
    return res.status(400).json({error: true, message: "Unauthorized."});
  }

  note.isPinned = !note.isPinned;

  await note.save();

  return res.json({error: false, note, message: "Note pinned successfully."});
});

app.get('/search/:query', authenticationToken, async (req, res) => {
  const query = req.params.query;
  const {user} = req.user;

  if(!query) {
    return res.status(400).json({error: true, message: "Please enter a search query."});
  }

  const searchPattern = new RegExp(query, 'i');

  const notes = await Note.find({
    userId: user._id,
    $or: [
      { title: { $regex: searchPattern } },
      { content: { $regex: searchPattern } },
      { tags: { $regex: searchPattern } }
    ]
  });



  if(!notes) {
    return res.status(400).json({error: true, message: "No notes found."});
  }

  return res.json({error: false, notes, message: "Notes retrieved successfully."});
});

// app.get('/user', authenticationToken, async (req, res) => {
//   const {user} = req.user;

//   const isUser = await User.findById({_id: user._id});

//   if(!isUser) {
//     return res.status(400).json({error: true, message: "User not found."});
//   }

//   return res.json({error: false, user: {firstName: isUser.firstName, lastName: isUser.lastName, email:isUser.email, _id: isUser._id, createdAt: isUser.createdAt}, message: "User retrieved successfully."});
// });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
