const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();


// For testing purposes with neo4j. Would not be included in final server.
const neo4j = require('neo4j-driver').v1;

// Require helper functions
const helper = require('./dataHelper.js');

// Tell express to use pug as a view engine and where to find the view templates
app.set('views', path.join(__dirname, "public"));
app.set('view engine', 'pug');

// Apply the express.static middleware to allow access to static files such as .css and .js files
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.send('<h1>Report Server is up and running</h1>')
});


app.get('/report', (req, res) => {
    console.log(req.query);
    var body = { id: req.query.nodeId };
    //var body = { id: 2758 };
    fetch('http://localhost:8080/BasicGenericDataService/report/generate/report', { 
        method: 'POST',
        body:    JSON.stringify(body),
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'admin'
        },
    })
        .then(response => response.json())
        .then(report => res.render('index', {report: JSON.stringify(report)}))
        .catch(err => console.error(err));
})

app.listen(3000, () => console.log('App is listening on Port 3000!'));

