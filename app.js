const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const resolver = require('./graphql/resolvers/index')
const schema = require('./graphql/schema/index')
const isAuth = require('./middleware/is-auth')


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-neupe.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true  } )
.then(()=>{
    app.listen(3000, ()=>{
        console.log("Server started at port 3000 ")
   })
}) 
.catch((err)=>{
    console.log("Error message -->", err);
})

const app = express();
app.use(isAuth)
app.use(bodyParser.json());

app.use((req,res,next) =>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');

    if(req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    next();
});

app.use('/graphql',
 graphqlHttp({
    schema: schema,
    rootValue: resolver,
    graphiql: true
}))

app.get('/', (req,res)=>{
    res.send("hello "); 
})