const express = require("express");
const expressGraphQL = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLScalarType,
} = require("graphql");
const { Kind } = require("graphql/language");

const books = require("./books");
const genres = require("./genres");
const status = require("./status");

const app = express();

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "DateTime custom scalar type",
  parseValue(value) {
    return new Date(value).toISOString(); // value from the client
  },
  serialize(value) {
    return value.toDateString(); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value); // ast value is always in string format
    }
    return null;
  },
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    created: {
      type: DateTime,
      resolve: (book) => new Date(book.created),
    },
    genre: {
      type: GenreType,
      resolve: (book) => {
        return genres.find((genre) => genre.name === book.genre);
      },
    },
    status: {
      type: StatusType,
      resolve: (book) => {
        return status.find((status) => status.name === book.status);
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
      resolve: (genre) => {
        return books.filter((book) => book.genre === genre.name);
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
        return books.filter((book) => book.status === status.name);
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
      resolve: () =>
        books.sort(
          (bookA, bookB) =>
            new Date(bookA.created) - new Date(bookB.created)
        ),
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
        name: { type: GraphQLString },
      },
      resolve: (parent, args) =>
        genres.find((genre) => genre.name === args.name),
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
        name: { type: GraphQLString },
      },
      resolve: (parent, args) =>
        status.find((status) => status.name === args.name),
    },
  }),
});

const ROOT_MUTATION = new GraphQLObjectType({
  name: "mutations",
  description: "Root Mutations",
  fields: () => ({
    search: {
      type: new GraphQLList(BookType),
      description: "Search for changes",
      args: {
        text: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        return books.filter(
          (book) =>
            book.name.includes(args.text) ||
            book.genre.includes(args.text) ||
            book.status.includes(args.text)
        );
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: ROOT_QUERY,
  mutation: ROOT_MUTATION,
});

// cors
const cors = require("cors");
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
