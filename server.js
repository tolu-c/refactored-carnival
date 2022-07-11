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
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
} = require("graphql-iso-date");

const app = express();

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
  { id: 1, name: "Book 1", genreId: 1, statusId: 1, created: "2020-01-01" },
  { id: 2, name: "Book 2", genreId: 2, statusId: 2, created: "2020-01-02" },
  { id: 3, name: "Book 3", genreId: 3, statusId: 1, created: "2020-01-03" },
  { id: 4, name: "Book 4", genreId: 2, statusId: 2, created: "2020-01-04" },
  { id: 5, name: "Book 5", genreId: 5, statusId: 1, created: "2020-01-05" },
  { id: 6, name: "Book 6", genreId: 6, statusId: 2, created: "2020-01-06" },
  { id: 7, name: "Book 7", genreId: 7, statusId: 1, created: "2020-01-07" },
  { id: 8, name: "Book 8", genreId: 8, statusId: 2, created: "2020-01-08" },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    genreId: { type: GraphQLNonNull(GraphQLInt) },
    statusId: { type: GraphQLNonNull(GraphQLInt) },
    created: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (book) => new Date(book.created).toISOString(),
    },
    // created: {
    //   type: CreatedType,
    //   resolve: (book) => new Date(book.created).toISOString(),
    // },
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

const CreatedType = new GraphQLObjectType({
  name: "Created",
  description: "This represents a created date",
  fields: () => ({
    created: {
      type: GraphQLNonNull(GraphQLString),
      resolve: () => {
        return new Date(2020 - 01 - 01);
      },
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (created) => {
        return books.filter((book) => book.created === created);
      },
    },
  }),
});

// const CreatedType = new GraphQLObjectType({
//   name: "Created",
//   description: "This represents a created",
//   fields: () => {
//     time: { type: DateTimeField},
//     resolve: () => new Date(books.created)
//   }
// });

const GenreType = new GraphQLObjectType({
  name: "Genre",
  description: "This represents a genre",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (genre) => {
        return books.filter((book) => book.genreId === genre.id);
      },
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
      resolve: (status) => {
        return books.filter((book) => book.statusId === status.id);
      },
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
    statuses: {
      type: new GraphQLList(StatusType),
      description: "List of status",
      resolve: () => status,
    },
    status: {
      type: StatusType,
      description: "A single status",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => status.find((status) => status.id === args.id),
    },
    // createdAt: {
    //   type: new GraphQLList(CreatedType),
    //   description: "List of created",
    //   resolve: () => created,
    // },
  }),
});

const schema = new GraphQLSchema({
  query: ROOT_QUERY,
});

// cors
const cors = require('cors');
app.use(cors());

app.use(
  "/api",
  expressGraphQL({
    schema: schema,
    graphiql: true,
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
