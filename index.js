import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import connectDB from "./drivers/db.js"
import mongoose from "mongoose"
import BookModel from "./schemas/bookSchema.js"
import AuthorModel from "./schemas/authorSchema.js"

//Importar la data: books
import { books } from "./resources/data.cjs"


connectDB()


const typeDefs = `#graphql
  type Author{
    authorId : String
    name : String
    country : String
    books : [Book]
  }
    
  type Book{
    id : String
    title : String
    author : String
    pages : Int
    year : Int
    genre :String
  }
  
  type Mutation {
    createAuthor(authorId: String!, name: String!, country: String!, books: [String!]!): Author
    createBook(id: String!, title: String!, authorId: String, pages: Int!, year: Int!, genre: String!): Book
    updateAuthor(authorId: String!, name: String, country: String, books: String): Author
    updateBook(id: String!, title: String, authorId: String, pages: Int, year: Int, genre: String): Book
    deleteAuthor(authorId: String!): Author
    deleteBook(id: String!): Book
  }

  # "books" retorrna un array vacío o mas Books 
  type Query {
    authors: [Author]
    books: [Book]
    findByAuthorId(authorId:String!):Author
    findById(id:String!):Book
    findByGenre(genre:String!):Book
    findByYear(year:Int!):Book
  }
`
// MongoDB Schema

//const BookModel = bookSchema
//const AuthorModel = authorSchema

// Resolvers
const resolvers = {
  Query: {
    authors: async () => {
      const authors = await AuthorModel.find().populate('books')
      return authors.map(author => ({
        ...author._doc,
        books: author.books.map(book => ({
          ...book._doc,
          id: book.id.toString('hex')
        }))
      }));
    },
    books: async () => {
      
      const books = await BookModel.find().lean();
      return books.map(book => ({
        id: book._id.toString(), 
        title: book.title,
        pages: book.pages,
        year: book.year,
        genre: book.genre
      }));
    },
    findByAuthorId: async (parent, args) => await AuthorModel.findById(args.authorId).populate('books'),
    findById: async (parent, args) => await BookModel.findById(args.id),
    findByGenre: async (parent, args) => await BookModel.find({ genre: args.genre }),
    findByYear: async (parent, args) => await BookModel.find({ year: args.year })
  },
  Mutation: {
    createAuthor: async (_, { authorId, name, country, books }) => {
      const existingAuthor = await AuthorModel.findOne({ authorId })

if (existingAuthor) {
  console.log("El autor ya está guardado")
  throw new Error("El autor ya está agregado")
}

const newAuthor = new AuthorModel({
  authorId,
  name,
  country,
  books
})


await newAuthor.save()
return newAuthor
    },
createBook: async (_, { id, title, authorId, pages, year, genre }) => {
  const existingBook = await BookModel.findOne({ id });
  if (existingBook) {
    console.log("El libro ya está agregado");
    throw new Error("El libro ya está agregado");
  }

  const newBook = new BookModel({
    id,
    title,
    author: authorId,
    pages,
    year,
    genre
  });

  await newBook.save();
  return newBook;
},
  updateAuthor: async (_, { authorId, name, country, books }) => {
    const updateData = {
      ...(name && { name }),
      ...(country && { country }),
    };

    // Actualiza los datos del autor
    const updatedAuthor = await AuthorModel.findOneAndUpdate(
      { authorId },
      updateData,
      { new: true }  // Devuelve el autor actualizado
    );

    // Verificar si se proporciona un ID de libro y si existe
    if (books) {
      const existingBook = await BookModel.findOne({ id: books }); // Verifica si el libro existe

      if (!existingBook) {
        console.log(`Book with ID ${books} does not exist.`);
        return;
      }

      // Si el libro existe, agregarlo a la lista de libros del autor
      await AuthorModel.findOneAndUpdate(
        { authorId },
        { $addToSet: { books } } // Agrega el ID del libro a la lista de libros
      );
    }

    return {
      authorId: updatedAuthor.authorId,
      name: updatedAuthor.name,
      country: updatedAuthor.country,
      books: updatedAuthor.books  // Devuelve el array actualizado de libros
    };
  },

    /**updateAuthor: async (_,{authorId, name, country, books}) => {
        const updateAuthor = await AuthorModel.findOneAndUpdate(
          { authorId },
          { name, country},
          { new: true }
        )
      }, */

    updateBook: async (_, { id, title, authorId, pages, year, genre }) => {
      const updatedBook = await BookModel.findOneAndUpdate(
        { id },
        { title, author: authorId, pages, year, genre },
        { new: true }
      );

      if (!updatedBook) {
        throw new Error("Libro no encontrado");
      }

      return updatedBook;
    },
      deleteAuthor: async (_, { authorId }) => {
        const deletedBook = await AuthorModel.findOneAndDelete({ authorId })
        if (!deletedBook) {
          throw new Error("Id no encontrado")
        }
        return `Author con ${authorId} eliminado exitosamente.`
      },
        deleteBook: async (_, { id }) => {
          const deletedBook = await BookModel.findOneAndDelete({ id });
          if (!deletedBook) {
            throw new Error("Libro no encontrado");
          }
          return `Libro con id ${id} eliminado exitosamente.`;
        }
  },
};
/*
const resolvers = {
  Query: {
    books: () => books,
    findById: (parent, args) => books.find(book => book.id === args.id),
    findByAuthor: (parent, args) => books.filter(book => book.author.name.toLowerCase() === args.name.toLowerCase()),
    findByGenre: (parent, args) => books.find(book => book.genre === args.genre)
  },
  Mutation: {
    createBook: (_, { id, title, author, pages, year, genre }) => {
      const existingAuthor = books.find(book => book.author.name === author.name && book.author.country === author.country)

      const existingBook = books.find(book => book.id === id)

      if (!existingBook) {
        const newBook = {
          id,
          title,
          author: existingAuthor ? existingAuthor.author : author, 
          pages,
          year,
          genre
        }

        books.push(newBook)
        return newBook
      }
      else
        console.log("El libro ya está agregado")

    },
    updateBook: (_, { id, title, author, pages, year, genre }) => {

      const bookIndex = books.findIndex(book => book.id === id)

      if (bookIndex === -1) {
        throw new Error("Libro no encontrado")
      }

      const updatedBook = {
        ...books[bookIndex],
        title: title !== undefined ? title : books[bookIndex].title,
        author: author !== undefined ? author : books[bookIndex].author,
        pages: pages !== undefined ? pages : books[bookIndex].pages,
        year: year !== undefined ? year : books[bookIndex].year,
        genre: genre !== undefined ? genre : books[bookIndex].genre,
      }

      books[bookIndex] = updatedBook;
      return updatedBook;
    },
    deleteBook: (_, { id }) => {
      const bookIndex = books.findIndex(book => book.id === id);
      if (bookIndex === -1) {
        throw new Error("Libro no encontrado")
      }

      books.splice(bookIndex, 1)
      return `Libro con id ${id} eliminado exitosamente.`
    }
  },
}
*/
//instancia de apollo server

const server = new ApolloServer({
  typeDefs,
  resolvers
})

// crear app de express
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
})

console.log(`Server ready at: ${url} `)