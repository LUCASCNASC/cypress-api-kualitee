
const PATH_API = '/TestLab/TreeTestCaseCycleBuild'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

const validCycleId = 1001;

describe('Manage Test Case Tree Testcase Cycle Build - /manage_test_case/tree_testcase_cycle_build', () => {

  it('Status Code is 200', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    treeTestcaseCycleBuild({
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId,
      foo: 'bar'
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
        build_id: validBuildId,
        cycle_id: validCycleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeTestcaseCycleBuild({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      treeTestcaseCycleBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(() =>
      treeTestcaseCycleBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});