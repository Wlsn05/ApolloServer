
import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema ({

  id: {
    type: String,
    required:true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Author"
  },
  pages: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    required: true
  }

})

export default mongoose.model('Book', bookSchema)