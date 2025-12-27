const PATH_API = '/TestCase/Detail';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTcId = 1001; 

describe('API rest - Test Case Details - /test_case/details', () => {

  it('Status Code is 200', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testCaseDetails({
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Ignora campo extra na query', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const queries = Array(10).fill(0).map(() => ({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    }));
    const requests = queries.map(q => testCaseDetails(q));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    })
      .then(() => testCaseDetails({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});