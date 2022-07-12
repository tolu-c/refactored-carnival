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

const books  = require("./books");
const genres = require("./genres");
const status = require("./status");

const app = express();

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
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
    // createdAt: {
    //   type: new GraphQLList(CreatedType),
    //   description: "List of created",
    //   resolve: () => created,
    // },
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
            book.name === args.text ||
            book.genre === args.text ||
            book.status === args.text
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
