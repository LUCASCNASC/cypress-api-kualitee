const PATH_API = '/TestLab/TreeDragTestCaseinModules'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

describe('Manage Test Case Tree Drag TC In Modules - /manage_test_case/tree_drag_tc_in_modules', () => {

  it('Status Code are 200', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    treeDragTcInModules({
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeDragTcInModules({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      treeDragTcInModules({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    treeDragTcInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(() =>
      treeDragTcInModules({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});