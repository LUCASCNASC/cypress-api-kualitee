const PATH_API = '/Test%20Scenario/ExportCSV'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validExportTypes = ['CSV', 'Excel', 'Word'];

describe('Test Scenario Export CSV - /test_scenario/export_csv', () => {

  it('Status Code is 400, 401, 403', () => {
    exportTestScenario({
      project_id: validProjectId,
      export_type: 'CSV'
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    exportTestScenario({
      token: validToken,
      project_id: validProjectId,
      export_type: 'CSV',
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        export_type: 'CSV'
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    exportTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      export_type: 'CSV'
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    exportTestScenario({
      token: validToken,
      project_id: validProjectId,
      export_type: 'CSV'
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      exportTestScenario({
        token: validToken,
        project_id: validProjectId,
        export_type: 'CSV'
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    exportTestScenario({
      token: validToken,
      project_id: validProjectId,
      export_type: 'CSV'
    })
      .then(() => exportTestScenario({
        token: validToken,
        project_id: validProjectId,
        export_type: 'CSV'
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});