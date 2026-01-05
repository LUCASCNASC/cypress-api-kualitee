
const PATH_API = '/TestLab/TreeTestCaseinBuildcycletestScenario';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCycleId = 1001;
const validTestScenarioId = 1234;

describe('Manage Test Case Tree Testcase In Build Cycle Test Scenario - /manage_test_case/tree_testcase_in_build_cycle_ts', () => {

  it('Status Code: 200', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    treeTestcaseInBuildCycleTs({
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeTestcaseInBuildCycleTs({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(() =>
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});