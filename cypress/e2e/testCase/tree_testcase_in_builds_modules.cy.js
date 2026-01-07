const PATH_API = '/TestCase/TreeTestCasesinBuildModule';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

describe('Test Case Tree in Build Modules - /test_case/tree_testcase_in_build_modules', () => {

  it('Status Code are 200', () => {
    testCaseTreeInBuildModules({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    testCaseTreeInBuildModules({
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    testCaseTreeInBuildModules({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        module_id: validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseTreeInBuildModules({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    testCaseTreeInBuildModules({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      testCaseTreeInBuildModules({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        module_id: validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    testCaseTreeInBuildModules({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId
    })
      .then(() => testCaseTreeInBuildModules({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        module_id: validModuleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});