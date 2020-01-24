const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Event = require('../../model/event')
const User = require('../../model/user')

const user = userId => {
    return User.findById(userId)
    .then(user => {
        return { 
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user.createdEvents)
        }
    })
    .catch(err=>{
        throw err;
    })
}

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds }})
    .then( events => {
        return events.map(event=> {
            return{ 
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator) 
            };
        })
    })
    .catch(err=>{
        throw err;
    })
}


module.exports = {
    events: ()=> {
        return Event.find()
        .then( events => {
            return events.map( event =>{
                return { 
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                    // {
                    //     ...event._doc.creator._doc,
                    //     _id: event._doc.creator.id,
                    //     password:"********"
                    // }
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
           createdEvent = {
               ...result._doc,
               date: new Date(event._doc.date).toISOString(),
               creator: user.bind(this, result._doc.creator)
            };
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
}