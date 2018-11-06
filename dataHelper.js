// Add this to index to test
// Normally the Data would be sent to this server directly.
// In this case we test the query that would be built by the generic application.
/* 
app.get('/test', (req, res) => {
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
 */

const neo4j = require("neo4j-driver").v1;
var reportData = {};
var diagramData = [];
var amountDatasets = 0;
var datasetsCreated = 0;

const resolveReportResult = function(records, session, res) {
  if (records && records.length > 0) {
    const report = records[0].get("report").properties;
    const diagrams = records.map(record => record.get("diagram").properties);
    reportData.title = report.listname;

    // Init the diagramData
    diagramData = diagrams.map(diagram => ({
      title: diagram.listname,
      type: diagram.type,
      datasets: []
    }));

    // Load the dataset definitions for all diagrams
    var promises = [];
    diagramData.forEach(diagram => {
      const query = `MATCH (n:Diagram {listname: '${diagram.title}', type: '${diagram.type}'})-[:HAS_DATASET]->(d:Dataset), 
        (n)-[:X_VALUE]->(x) RETURN n as diagram, d as dataset, COLLECT(x) as x`;
      promises.push(session.run(query));
    });

    // Resolve the dataset promises
    Promise.all(promises).then(results => {
      resolveDatasetResult(results, session, res);
    });
  }
};

// Handle all datasets and look for the data definitions
const resolveDatasetResult = function(results, session, res) {

  // Calculate the amount of datasets. This will be our metric for when the response is sent
  results.forEach(result => {
    amountDatasets += result.records.length;
  });

  results.forEach(result => {
    let diagram = result.records[0].get('diagram').properties;
    let xValues = result.records[0].get('x').map( x => x.properties);
    let datasets = result.records.map( record => record.get('dataset').properties);

    // The x-labels are the same for the whole diagram so we can set them already
    let diagramIndex = diagramData.findIndex(data => data.title === diagram.listname);
    diagramData = [
      ...diagramData.slice(0,diagramIndex),
      {...diagramData[diagramIndex], labels: xValues.map(x => x.listname)},
      ...diagramData.slice(diagramIndex + 1)
    ];

    // Load the y values for each xValue for each dataset
    datasets.forEach(dataset => {

      var baseQuery;
      if (dataset.labelName && dataset.labelName !== "") {
        baseQuery = `MATCH (n:${dataset.labelName}) WHERE RETURN count(n) as amount`;
      } else {
        // TODO: Implementation for custom query
        console.log('landed here by accident');
      }

      var promises = [];
      xValues.forEach(xValue => {

        let indexOfReturn = baseQuery.toLowerCase().indexOf('return');
        let query = `${baseQuery.substring(0, indexOfReturn - 1)} ${xValue.whereCondition} ${baseQuery.substring(indexOfReturn)}`;
        promises.push(session.run(query));
      });

      Promise.all(promises).then(results => {
        resolveValueResultOfDataset(diagram.listname, dataset.listname, results, session, res);
      });

    });
  });
};

const resolveValueResultOfDataset = function (diagramName, datasetLabel, results, session, res) {

  var dataset = {label: datasetLabel, data: []};
  results.forEach(result => {
    var amount = result.records[0].get('amount');
    if (neo4j.isInt(amount)) {
      amount = +amount.toString();
    }
    dataset.data.push(amount);
  });

  // Set the datasets for each diagram
  let diagramIndex = diagramData.findIndex(data => data.title === diagramName);
  diagramData[diagramIndex].datasets.push(dataset);

  // When all datasets are created we can build and send the response
  datasetsCreated += 1;
  if (datasetsCreated === amountDatasets) {
    reportData.diagrams = diagramData;
    res.render('index', {report: JSON.stringify(reportData)});
  }
  
}

module.exports = {
  resolveReportResult: resolveReportResult
};

function listnameInArray(array, element) {
  for(var i=0; i < array.length; i++) {
    if (array[i].listname === element.listname) {
      return true;
    }
  }
  return false;
}