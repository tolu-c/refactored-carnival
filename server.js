const express = require("express");
const expressGraphQL = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const status = [
  { id: 1, name: "Published" },
  { id: 2, name: "Not published" },
];

const genres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Drama" },
  { id: 3, name: "Comedy" },
  { id: 4, name: "Horror" },
  { id: 5, name: "Thriller" },
  { id: 6, name: "Sci-Fi" },
  { id: 7, name: "Romance" },
  { id: 8, name: "Mystery" },
];

const books = [
  { id: 1, name: "Book 1", genreId: 1, statusId: 1 },
  { id: 2, name: "Book 2", genreId: 2, statusId: 2 },
  { id: 3, name: "Book 3", genreId: 3, statusId: 1 },
  { id: 4, name: "Book 4", genreId: 4, statusId: 2 },
  { id: 5, name: "Book 5", genreId: 5, statusId: 1 },
  { id: 6, name: "Book 6", genreId: 6, statusId: 2 },
  { id: 7, name: "Book 7", genreId: 7, statusId: 1 },
  { id: 8, name: "Book 8", genreId: 8, statusId: 2 },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    genreId: { type: GraphQLNonNull(GraphQLInt) },
    statusId: { type: GraphQLNonNull(GraphQLInt) },
    genre: {
      type: GenreType,
      resolve: (book) => {
        return genres.find((genre) => genre.id === book.genreId);
      },
    },
    status: {
      type: StatusType,
      resolve: (book) => {
        return status.find((status) => status.id === book.statusId);
      },
    },
  }),
});

const GenreType = new GraphQLObjectType({
  name: "Genre",
  description: "This represents a genre",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: () => {},
    },
  }),
});

const StatusType = new GraphQLObjectType({
  name: "Status",
  description: "This represents a status",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: () => {},
    },
  }),
});

const ROOT_QUERY = new GraphQLObjectType({
  name: "query",
  description: "Root Query",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "List of books",
      resolve: () => books,
    },
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    genres: {
      type: new GraphQLList(GenreType),
      description: "List of genres",
      resolve: () => genres,
    },
    genre: {
      type: GenreType,
      description: "A single genre",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => genres.find((genre) => genre.id === args.id),
    },
    status: {
      type: new GraphQLList(StatusType),
      description: "List of status",
      resolve: () => status,
    },
  }),
});

const schema = new GraphQLSchema({
  query: ROOT_QUERY,
});

app.use('/api', expressGraphQL({
  schema: schema,
  graphiql: true,
  }));

const app = express();

app.listen(4444, () => console.log("server listening on port 4444"));
