const PATH_API = '/Test%20Scenario/TestScenarioList'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

const validRequirementId = 88;
const validCreatedBy = [123];

describe('Test Scenario List - /test_scenario/list', () => {

  it('Status Code is 200', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 200', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      requirement_id: validRequirementId,
      created_by: validCreatedBy,
      export: 'yes',
      export_type: 'CSV'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testScenarioList({
      project_id: validProjectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    testScenarioList({
      token: validToken
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId,
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
        project_id: validProjectId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testScenarioList({
      token: "' OR 1=1 --",
      project_id: validProjectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      testScenarioList({
        token: validToken,
        project_id: validProjectId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId
    })
      .then(() => testScenarioList({
        token: validToken,
        project_id: validProjectId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});