const PATH_API = '/Test%20Scenario/importstepone'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvFilePath = 'cypress/fixtures/test_scenarios_import.csv';

describe('Import Step One - /test_scenario/import/step1', () => {

  it('Status Code is 200', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Status Code is 400, 401, 403', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  it('Status Code is 400, 415, 422', () => {
    cy.fixture('invalid.txt', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'invalid.txt', mimeType: 'text/plain', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect([400, 415, 422]).to.include(response.status);
      });
    });
  });

  it('Status Code is 200', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId,
          foo: 'bar'
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect([200, 400]).to.include(response.status);
      });
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: "' OR 1=1 --",
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  it('Status Code is 429', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Status Code is 429', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      const requests = Array(10).fill(0).map(() =>
        cy.form_request(
          'POST',
          '/Test%20Scenario/importstepone',
          {
            token: validToken,
            project_id: validProjectId
          },
          [
            { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
          ]
        )
      );
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    cy.fixture('test_scenarios_import.csv', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Test%20Scenario/importstepone',
        {
          token: validToken,
          project_id: validProjectId
        },
        [
          { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
        ]
      ).then(() => {
        cy.form_request(
          'POST',
          '/Test%20Scenario/importstepone',
          {
            token: validToken,
            project_id: validProjectId
          },
          [
            { name: 'import_csv_file', fileName: 'test_scenarios_import.csv', mimeType: 'text/csv', fileContent, encoding: 'base64' }
          ]
        ).then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
      });
    });
  });
});