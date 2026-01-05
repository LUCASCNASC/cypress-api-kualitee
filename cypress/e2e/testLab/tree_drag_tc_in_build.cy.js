const PATH_API = '/TestLab/TreeTragTesetCaseinBuild'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

describe('Manage Test Case Tree Drag TC In Build - /manage_test_case/tree_drag_tc_in_build', () => {

  it('Status Code: 200', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    treeDragTcInBuild({
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
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
        build_id: validBuildId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeDragTcInBuild({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      treeDragTcInBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(() =>
      treeDragTcInBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});