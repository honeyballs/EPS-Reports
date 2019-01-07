const zeroOptions = {
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
}
var tables = [];

function setTitleAndHeader(title) {
    document.title = title;
    $("#report-headline").text(title);
}

function createRandomColor() {
    let randomizer = () => Math.floor(Math.random() * (255 - 1));
    return `rgba(${randomizer()}, ${randomizer()}, ${randomizer()}, 0.5)`;
}

function createTable(data, id) {

    // Sort the columns
    data.columns.sort((a, b) => {
        if (a.order < b.order) {
            return -1;
        } else if (a.order > b.order) {
            return 1;
        }
        return 0;
    })

    var table = $('<table>')
        .append($('<thead>')
            .append($('<tr>')
                .append(
                    data.columns.map(column => $('<th>').append(column.name))
                )
            )
        )

    var finishedTable = createRows(table, data);

    $('<div>').attr({
            id: id,
            class: "table-div"
        })
        .append(finishedTable)
        .appendTo('#report')

}

function createRows(table, data) {

    if (data.groupBy && data.groupBy.length > 0) {
        return createGroupedRows(table, data)
    }

    return table.append(
        $('<tbody>').append(
            data.data.map(row => {
                return $('<tr>').append(
                    data.columns.map(column => $('<td>').append(row[column.name]))
                )
            })
        )
    )
}

function createGroupedRows(table, data) {
    var groupField = data.groupBy;
    var groupedFields = [];
    var groupedRows = [];

    data.data.forEach(row => {
        // if we already grouped all data for this field we can skip it
        if (!groupedFields.includes(row[groupField])) {
            var parameter = row[groupField];
            var newRow = {
                data: []
            }
            newRow[groupField] = parameter;
            data.data.forEach(tempRow => {
                // Get all properties except the groupField if matching
                if (tempRow[groupField] === parameter) {
                    var modifiedRow = Object.assign({}, tempRow);
                    delete modifiedRow[groupField];
                    newRow.data.push(modifiedRow);
                }
            });

            // Save that that value was grouped by
            groupedFields.push(parameter);
            groupedRows.push(newRow);
        }

    })


    // Create all table rows
    var rows = [];
    groupedRows.forEach(row => {
        // The first row of each group contains the field on which the grouping is done
        var firstRow = row.data[0];
        firstRow[groupField] = row[groupField]
        rows.push(
            $('<tr>').append(
                data.columns.map(column => {
                    var td = $('<td>').append(firstRow[column.name])
                    if (column.name === groupField) {
                        td.attr({
                            class: 'group'
                        });
                    }
                    return td;
                })
            )
        )
        // Now we add all other rows if available
        if (row.data.length > 0) {
            row.data.forEach((dataRow, index) => {
                if (index > 0) {
                    rows.push(
                        $('<tr>').append(data.columns.map(column => $('<td>').append(dataRow[column.name])))
                    )
                }
            })
        }
    })

    return table.append($('<tbody>').append(rows));

}

function createChart(diagram, canvasId) {
    // Create a color array for each dataset
    diagram.datasets.forEach(dataset => {
        let colorArray = [];
        let color = createRandomColor();
        if (diagram.type.toLowerCase() === 'pie') {
            dataset.data.forEach(data => {
                colorArray.push(createRandomColor());
            });
        } else {
            dataset.data.forEach(data => {
                colorArray.push(color);
            });
        }
        dataset.backgroundColor = colorArray;
        if (diagram.type.toLowerCase() === 'line') {
            dataset.borderColor = color;
        }
    });
    let ctx = $("#" + canvasId)[0].getContext('2d');
    if (diagram.type.toLowerCase() === 'line') {
        createLineChart(ctx, diagram);
    } else {
        let myChart = new Chart(ctx, {
            type: diagram.type.toLowerCase(),
            data: {
                labels: diagram.labels,
                datasets: diagram.datasets
            },
            options: diagram.type.toLowerCase() !== 'pie' ? zeroOptions : {}
        });
    }
}

function createLineChart(ctx, diagram) {
    let datasets = diagram.datasets;
    // If fill is not set to false, the line looks whack
    let datasetsWithOptions = datasets.map(ds => ({ ...ds,
        fill: false
    }))
    let chart = new Chart(ctx, {
        type: diagram.type.toLowerCase(),
        data: {
            labels: diagram.labels,
            datasets: datasetsWithOptions
        },
        options: zeroOptions
    })
}

function createReport(report) {

    report.tables.forEach(function (table) {
        let id = 0; // Create the title and canvas to insert the diagram into
        let titleId = "table-title-" + id;
        let divId = "table-div-" + id;

        $('<h2>').attr({
            id: titleId
        }).text(table.title).appendTo('#report');

        createTable(table, divId);
        id += 1;
    });

    report.diagrams.forEach(function (diagram) {
        // Create the title and canvas to insert the diagram into
        let id = 0;
        let titleId = "diagramm-title-" + id;
        let canvasId = "canvas-" + id;

        $('<h2>').attr({
            id: titleId
        }).text(diagram.title).appendTo('#report');

        $('<canvas>').attr({
            id: canvasId
        }).appendTo('#report');

        // Create the diagram
        createChart(diagram, canvasId);
        id += 1;
    });
};

function testTable() {

    let testData = {
        title: 'Test Tabelle',
        groupBy: 'verantwortliche',
        columns: [{
                name: 'Verantwortliche',
                order: 3,
                field: 'verantwortliche'
            },
            {
                name: 'IP',
                order: 1,
                field: 'ip'
            },
            {
                name: 'E-Mail',
                order: 4,
                field: 'mail'
            },
            {
                name: 'Servername',
                order: 2,
                field: 'servername'
            }
        ],
        data: [{
                ip: '212.201.31.161',
                servername: 'lasergruppe.mnd.thm.de',
                verantwortliche: 'Daniel Thölken',
                mail: 'daniel.thoelken@mnd.thm.de'
            },
            {
                ip: '212.201.31.210',
                servername: 'lm.mnd.thm.de',
                verantwortliche: 'Irina Scheffler',
                mail: 'irina.scheffler@mnd.thm.de'
            },
            {
                ip: '212.201.31.214',
                servername: 'master13.mnd.thm.de',
                verantwortliche: 'Oliver Scheliga',
                mail: ''
            },
            {
                ip: '212.201.31.139',
                servername: 'process-01.mnd.thm.de',
                verantwortliche: 'Nicole Müller',
                mail: 'nicole.mueller@mnd.thm.de'
            },
            {
                ip: '212.201.31.215',
                servername: 'test-db-02.mnd.thm.de',
                verantwortliche: 'Nicole Müller',
                mail: 'nicole.mueller@mnd.thm.de'
            }
        ]
    };



}