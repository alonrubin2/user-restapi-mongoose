const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 4000;
const emailValidate = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// function isEmailRequired(age) {
//     if (age >= 78) {
//         return false;
//     }
//     return true;
// }
// tried bulding this function to pass to the "required" prop of email in schema, didn't work. tried a bunch of other things. they didn't work either.

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const User = mongoose.model('User', {
    username: {
        type: String,
        minLength: 3,
        maxLength: 18,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 16,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    age: {
        type: Number,
        min: 18,
        required: true
    },
    email: {
        type: String,
        match: emailValidate,
        required: true
    },
    createdAt:{
        type: Date,
        default: () => new Date()
    }
});


app.put('/user', (req, res) => {
    const user = new User(req.body);
    user.save()
        .then((newUser) => {
            res.status(201).send(newUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send(err);
        });
});

app.get('/user', (req, res) => {
    User.find()
        .then((users) => res.send(users))
        .catch(() => res.sendStatus(500));
});

app.get('/user/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => res.json(user))
        .catch(() => res.sendStatus(500))
});

app.delete('/user/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(deletedUser => {
            if (!deletedUser) {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(204);
        })
});

app.post('/user/:id', (req, res) => {
    User.findByIdAndUpdate(
        req.params.id,
        req.body
    ).then(updatedUser => {
        if (!updatedUser) {
            res.sendStatus(404);
            return;
        }
        res.sendStatus(200);
    })
    .catch((err) => {
        res.status(400).send(err)
    });
});




function listen() {
    app.listen(port, () => console.log(`server is listening at port ${port}`));
}
function connect() {
    mongoose.connect('mongodb://localhost/mongooseHW', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const db = mongoose.connection;
    db.on('error', console.log.bind(console, 'connection error'));
    db.once('open', () => {
        listen();
    });
}

connect();