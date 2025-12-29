const PATH_API = '/Test%20Case%20Execution/TreeTestCases'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCycleId = 1001;
  
describe('Test Case Execution Tree Test Cases - /test_case_execution/tree_test_cases', () => {

  it('Status Code is 200', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    treeTestCases({ project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    treeTestCases({ token: validToken, cycle_id: validCycleId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem cycle_id', () => {
    treeTestCases({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, cycle_id: validCycleId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeTestCases({ token: "' OR 1=1 --", project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId })
      .then(() => treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});