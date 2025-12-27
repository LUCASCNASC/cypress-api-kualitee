const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/TestLab/AddTestCasesCycle';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validNodeTo = { parent: { id: 1001, _type: 'cycle' } };
const validNodeFrom = { parent: { id: 2001 }, name: "TCExample", _type: "tc", checked: true };

describe('API rest - Manage Test Case Update - /manage_test_case/update', () => {

  it('Status Code is 200', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    manageTestCaseUpdate({
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom,
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
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    manageTestCaseUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom,
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      manageTestCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    manageTestCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      "node[to]": validNodeTo,
      "node[from]": validNodeFrom
    }).then(() =>
      manageTestCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        "node[to]": validNodeTo,
        "node[from]": validNodeFrom
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});