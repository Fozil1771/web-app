const express = require('express')

const path = require('path')
const fs = require('fs')
const app = express()
const methodOverride = require('method-override')
const bodyParser = require('body-parser')

// pop up library
// import swal from 'sweetalert';
const swal = require('sweetalert')
// validation
const { body, validationResult } = require('express-validator');

const dbPath = require('./configs').dbPath

//this line is required to parse the request body
app.use(express.json())

app.use(methodOverride('_method'))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');

app.use(express.static("public"))

/* util functions */

//read the user data from json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('users.json', stringifyData)
}

//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('users.json')
    return JSON.parse(jsonData)
}

/* util functions ends */



/* Read - GET method */
app.get('/', (req, res) => {
    const users = getUserData();


    res.render('pages/index', {
        users: users,
    });
})



/* Create - POST method */
app.post('/user/add/',

    body('username').not().isEmpty(),
    body('fullname').not().isEmpty(),
    body('email').isEmail().normalizeEmail(),
    // body('age').not().isEmpty().isNumeric(),

    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.render('pages/error', { errors: errors.array() })
        }

        //get the existing user data
        fs.readFile(dbPath('users'), (err, data) => {
            if (err) res.render('users', { success: false })

            const users = JSON.parse(data)



            users.push({
                id: Math.floor(Math.random() * new Date()),
                username: req.body.username,
                fullname: req.body.fullname,
                email: req.body.email,
                age: req.body.age || null


            })

            fs.writeFile(dbPath('users'), JSON.stringify(users), (err) => {
                if (err) res.render('users', { success: false })

                else {

                    res.redirect('/')
                }
            })
        })

    })




app.get('/user/list', function (req, res) {
    const users = getUserData()
    res.send(users);
});


app.get('/user/:id', function (req, res) {
    const users = getUserData()
    const { id } = req.params


    const founduser = users.find(user => user.id === Number(id))
    console.log(founduser)



    // res.send(founduser)

    res.render('pages/edit', {
        id: id,
        user: founduser
    });
});


/* Update - Patch method */
app.post('/user/update/:id', (req, res) => {
    //get the username from url
    const { id } = req.params


    //get the update data

    //get the existing user data
    const existUsers = getUserData()

    //check if the username exist or not       
    const findExist = existUsers.find(user => user.id === Number(id))
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'username does not exist' })
    }

    //filter the userdata
    const updateUser = existUsers.filter(user => user.id !== Number(id))

    //push the updated data
    updateUser.push({
        id: Number(id),
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        age: req.body.age
    })


    swal("Updated successfully")

    //finally save it
    saveUserData(updateUser)

    res.redirect('/')

})

/* Delete - Delete method */
app.get('/user/delete/:id', (req, res) => {
    const { id } = req.params

    //get the existing userdata
    const existUsers = getUserData()

    const filterUser = existUsers.filter(user => user.id !== Number(id));



    if (existUsers.length === filterUser.length) {

        return res.status(409).send({ error: true, msg: 'username does not exist' })
    }


    //save the filtered data
    saveUserData(filterUser)
    res.redirect('/')

})



//configure the server port
app.listen(process.env.PORT, () => {
    console.log(`Server runs on port  ${process.env.PORT}`)
})