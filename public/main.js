function testTable() {
    let testData = {
        title: 'Test Tabelle',
        groupBy: 'verantwortliche',
        columns: [
            {name: 'Verantwortliche', order: 3, field: 'verantwortliche'},
            {name: 'IP', order: 1, field: 'ip'},
            {name: 'E-Mail', order: 4, field: 'mail'},
            {name: 'Servername', order: 2, field: 'servername'}
        ],
        data: [
            {ip: '212.201.31.161', servername: 'lasergruppe.mnd.thm.de', verantwortliche: 'Daniel Thölken', mail: 'daniel.thoelken@mnd.thm.de'},
            {ip: '212.201.31.210', servername: 'lm.mnd.thm.de', verantwortliche: 'Irina Scheffler', mail: 'irina.scheffler@mnd.thm.de'},
            {ip: '212.201.31.214', servername: 'master13.mnd.thm.de', verantwortliche: 'Oliver Scheliga', mail: ''},
            {ip: '212.201.31.139', servername: 'process-01.mnd.thm.de', verantwortliche: 'Nicole Müller', mail: 'nicole.mueller@mnd.thm.de'},
            {ip: '212.201.31.215', servername: 'test-db-02.mnd.thm.de', verantwortliche: 'Nicole Müller', mail: 'nicole.mueller@mnd.thm.de'}
        ]
    };


}

