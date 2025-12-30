const PATH_API = '/TestCase/TreeTtestCaseBuildModuleTestScenarios';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestScenarioId = 99; 

describe('Test Case Tree in Build Module Test Scenarios - /test_case/tree_testcase_in_build_module_ts', () => {

  it('Status Code is 200', () => {
    testCaseTreeInBuildModuleTs({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testCaseTreeInBuildModuleTs({
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    testCaseTreeInBuildModuleTs({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
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
        test_scenario_id: validTestScenarioId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseTreeInBuildModuleTs({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    testCaseTreeInBuildModuleTs({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      testCaseTreeInBuildModuleTs({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    testCaseTreeInBuildModuleTs({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId
    })
      .then(() => testCaseTreeInBuildModuleTs({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});