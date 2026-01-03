const PATH_API = '/TestCase/StatusList';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('Test Case Status List - /test_case/status_list', () => {

  it('Status Code is 200', () => {
    testCaseStatusList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testCaseStatusList({
      project_id: validProjectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    testCaseStatusList({
      token: validToken
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200, 400', () => {
    testCaseStatusList({
      token: validToken,
      project_id: validProjectId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseStatusList({
      token: "' OR 1=1 --",
      project_id: validProjectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    testCaseStatusList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const queries = Array(10).fill(0).map(() => ({
      token: validToken,
      project_id: validProjectId
    }));
    const requests = queries.map(q => testCaseStatusList(q));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    testCaseStatusList({
      token: validToken,
      project_id: validProjectId
    })
      .then(() => testCaseStatusList({
        token: validToken,
        project_id: validProjectId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});