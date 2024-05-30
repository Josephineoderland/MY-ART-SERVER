import mongoose from 'mongoose';

// Skapa en schema för inlägg
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

// Skapa en modell för inlägg baserat på schemat
const Post = mongoose.model('Post', postSchema);

export default Post;