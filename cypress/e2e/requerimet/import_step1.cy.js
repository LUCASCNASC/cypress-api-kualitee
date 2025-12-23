const PATH_API = '/Requirement/importstepone';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvPath = 'caminho/para/arquivo.csv';

describe('API rest - Requirements Import Step 1 - /requirements/import/step1', () => {

  it('Status Code is 200', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob,
      };
      importStep1(formData).then(response => {
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
      };
      importStep1(formData).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  it('Falha sem project_id', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      const formData = {
        token: validToken,
        import_csv_file: blob,
      };
      importStep1(formData).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha sem import_csv_file', () => {
    importStep1({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha com arquivo vazio', () => {
    const blob = Cypress.Blob.binaryStringToBlob('', 'text/csv');
    importStep1({
      token: validToken,
      project_id: validProjectId,
      import_csv_file: blob,
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha com arquivo não CSV', () => {
    const blob = Cypress.Blob.binaryStringToBlob('not,a,csv', 'text/plain');
    importStep1({
      token: validToken,
      project_id: validProjectId,
      import_csv_file: blob,
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
        foo: 'bar'
      };
      importStep1(formData).then(response => {
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
          import_csv_file: blob
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
      importStep1({
        token: "' OR 1=1 --",
        project_id: validProjectId,
        import_csv_file: blob
      }).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    cy.fixture(validCsvPath, 'binary').then(CSVContent => {
      const blob = Cypress.Blob.binaryStringToBlob(CSVContent, 'text/csv');
      importStep1({
        token: validToken,
        project_id: validProjectId,
        import_csv_file: blob
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
        import_csv_file: blob
      };
      const requests = Array(10).fill(0).map(() => importStep1(formData));
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
        import_csv_file: blob
      };
      importStep1(formData)
        .then(() => importStep1(formData))
        .then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
    });
  });
});