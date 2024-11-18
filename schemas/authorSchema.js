import mongoose, { Schema } from "mongoose";

const authorSchema = new Schema ({
  authorId: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
  }]
})

export default mongoose.model('Author', authorSchema)