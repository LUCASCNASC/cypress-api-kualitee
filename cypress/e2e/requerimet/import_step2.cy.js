const PATH_API = '/Requirement/importsteptwo';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvPath = 'caminho/para/arquivo.csv'; 
const validAssignedTo = 'user123';
const validDbColumns = [ 'col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8' ];

describe('API rest - Requirements Import Step 2 - /requirements/import/step2', () => {

  it('Status Code is 200', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        'db_columns[0]': validDbColumns[0],
        'db_columns[1]': validDbColumns[1],
        'db_columns[2]': validDbColumns[2],
        'db_columns[3]': validDbColumns[3],
        'db_columns[4]': validDbColumns[4],
        'db_columns[5]': validDbColumns[5],
        'db_columns[6]': validDbColumns[6],
        'db_columns[7]': validDbColumns[7],
        created_new: 'create'
      };
      importStep2(formData).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Falha sem token', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        'db_columns[0]': validDbColumns[0],
        created_new: 'create'
      };
      importStep2(formData).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  it('Falha com arquivo vazio', () => {
    const blob = Cypress.Blob.binaryStringToBlob('', 'text/csv');
    importStep2({
      token: validToken,
      project_id: validProjectId,
      import_csv_file: blob,
      assignedto: validAssignedTo,
      created_new: 'create'
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create',
        foo: 'bar'
      };
      importStep2(formData).then(response => {
        expect([200, 400]).to.include(response.status);
      });
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: {
          token: validToken,
          project_id: validProjectId,
          import_csv_file: blob,
          assignedto: validAssignedTo,
          created_new: 'create'
        },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 415]).to.include(response.status);
      });
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      importStep2({
        token: "' OR 1=1 --",
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
      }).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      importStep2({
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
      }).then(response => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
      };
      const requests = Array(10).fill(0).map(() => importStep2(formData));
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
        assignedto: validAssignedTo,
        created_new: 'create'
      };
      importStep2(formData)
        .then(() => importStep2(formData))
        .then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
    });
  });
});