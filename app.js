const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const bcrypt = require('bcryptjs');

const Event = require('./model/event')
const User = require('./model/user')

const mongoose = require('mongoose');

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

app.use(bodyParser.json());

app.use('/graphql',
 graphqlHttp({
    schema: buildSchema(`

    type Event {
        _id: ID!,
        title: String!,
        description: String!,
        price: Float!,
        date: String!,
        creator: User!
    }

    type User {
        _id: ID!,
        email: String!,
        password: String,
        createdEvents: [Event!]
    }

    input EventInput {
        title: String!,
        description: String!,
        price: Float!,
        date: String!
    }

    input UserInput {
        email: String!,
        password: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput:EventInput): Event
        createUser(userInput:UserInput): User 
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
    `),
    rootValue: {
        events: ()=> {
            return Event.find()
            .populate('creator')
            .then( events => {
                return events.map( event =>{
                    return { ...event._doc,
                        creator: {
                            ...event._doc.creator._doc,
                            _id: event._doc.creator.id,
                            password:"********"
                        }
                     }
                })
            })
            .catch( err => {
                console.log(err);
                throw err;
            })
        }, 
        createEvent: (args)=>{
        const event = new Event ({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5e29b9125a6ea7dfdf12d14a'
           });

           let createdEvent;

           return event
           .save()
           .then(result=>{
               createdEvent = {...result._doc};
               return User.findById('5e29b9125a6ea7dfdf12d14a');
           })
           .then(user=>{
               if(!user)
               {
                throw new Error("User does not exists");
               }
               user.createdEvents.push(event);
               return user.save();
           })
           .then(result=>{
               return createdEvent;
           })
           .catch(error=>{
               throw error;
           })
        },
        createUser: args =>{
            return User.findOne({email: args.userInput.email})
            .then(user=>{
                if(user){
                    throw new Error("User with this email already exists");
                }
                return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save()
                .then(result =>{
                    return { ...result._doc, password:"********"}
                })
                .catch(err => {
                    throw err;
                })
            })
            .catch(err => {
                throw err;
            })
            
        }
    },
    graphiql: true
}))

app.get('/', (req,res)=>{
    res.send("hello "); 
})