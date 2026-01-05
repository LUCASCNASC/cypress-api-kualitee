const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/step2';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvFile = 'cypress/fixtures/defects_import.csv';
const validAssignTo = 123;
const validDbColumns = [
  "build_id", "module_id", "description", "bugtype", "priority", "status", "devices", "os", "browser", "steps_to_reproduce", "eresult", "aresult"
];

describe('Cycle - Defects Import Step 2 - /defects/import/step2', () => {

  it('Status Code: 200', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        assignto: validAssignTo,
        create: 'yes',
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 200', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: [null, null, "description", null, null, null, null, "os"] // Apenas os obrigatórios preenchidos
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    defectsImportStep2(
      {
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns,
        foo: 'bar'
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsImportStep2(
      {
        token: "' OR 1=1 --",
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Status Code: 429', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsImportStep2(
        {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
        },
        validCsvFile
      )
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    defectsImportStep2(
      {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: validCsvFile,
        db_columns: validDbColumns
      },
      validCsvFile
    ).then(() =>
      defectsImportStep2(
        {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: validCsvFile,
          db_columns: validDbColumns
        },
        validCsvFile
      )
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});