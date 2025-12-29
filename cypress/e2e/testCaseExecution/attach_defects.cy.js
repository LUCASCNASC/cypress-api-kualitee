const PATH_API = '/Test%20Case%20Execution/attacheddefects'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTcId = 101;
const validTestScenarioId = 1234;
const validCycleId = 1001;
const validExecutionId = 222;
const validDefects = [555, 556];

describe('Test Case Execution Attach Defects - /test_case_execution/attach_defects', () => {

  it('Status Code is 200', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    attachDefects({
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    attachDefects({
      token: validToken,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem tc_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem testscenario_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem cycle_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem execution_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1],
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    attachDefects({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    })
      .then(() => attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});