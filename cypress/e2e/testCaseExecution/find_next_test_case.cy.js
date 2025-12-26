const PATH_API = '/Test%20Case%20Execution/FindNextTestcase'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

const validTcId = 101;
const validTestScenarioId = 1234;
const validCycleId = 1001;
const validOffsetTestExecutions = 0;

describe('API rest - Test Case Execution Find Next Test Case - /test_case_execution/find_next_test_case', () => {

  it('Status Code is 200', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    findNextTestCase({
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    findNextTestCase({
      token: validToken,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem tc_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem testscenario_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem cycle_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem build_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem offset_test_executions', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    findNextTestCase({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    })
      .then(() => findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});