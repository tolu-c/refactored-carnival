const express = require('express');
const expressGraphQL = require('express-graphql');

const app = express();

app.listen(4444, () => console.log('server listening on port 4444'));