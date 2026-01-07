const PATH_API = '/Test%20Scenario/TestScenarioDetail'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestScenarioId = 99;

describe('Test Scenario Detail - /test_scenario/details', () => {

  it('Status Code are 200', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    getTestScenarioDetails({
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 200, 400 string', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Content-Type deve ser application/json', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    getTestScenarioDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      getTestScenarioDetails({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    })
      .then(() => getTestScenarioDetails({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});