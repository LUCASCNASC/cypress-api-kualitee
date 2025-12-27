
const PATH_API = '/Test%20Scenario/TestScenarioDelete'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestScenarioId = 99;

describe('API rest - Test Scenario Delete - /test_scenario/delete', () => {

  it('Status Code is 200', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    deleteTestScenario({
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId,
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
        'test_scenario_id[0]': validTestScenarioId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    deleteTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      deleteTestScenario({
        token: validToken,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite deletar o mesmo cenário rapidamente', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    })
      .then(() => deleteTestScenario({
        token: validToken,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});