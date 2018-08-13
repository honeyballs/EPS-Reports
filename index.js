const express = require('express');
const path = require('path');
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
   res.render('index', {title: 'Age difference', labels: JSON.stringify(['0-20', '20-40', '40-60', '60+']), datasets: JSON.stringify([{label: 'Dataset 1', data: [24, 58, 13, 7]}])});
});

// Normally the Data would be sent to this server directly.
// In this case we test the query that would be built by the generic application.
app.get('/report', (req, res) => {
   console.log('received');
   const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'passwort'));
   const session = driver.session();

   // Get the report
   const metaQuery='MATCH (r:Report {listname: "Testreport"})-[:HAS_DIAGRAM]->(d:Diagram) RETURN r as report, d as diagram';
   const resultPromise = session.run(metaQuery);
   resultPromise.then( result => {
      helper.resolveReportResult(result.records, session, res);
   })

})

app.listen(3000, () => console.log('App is listening on Port 3000!'));

