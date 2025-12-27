const PATH_API = '/TestCase/Deleted';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validIds = Cypress.env('VALID_IDS');  

describe('API rest - Test Case Delete - /test_case/delete', () => {

  it('Status Code is 200', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Deleta múltiplos casos de teste', () => {
    const body = {
      token: validToken,
      project_id: validProjectId
    };
    validIds.forEach((id, i) => body[`id[${i}]`] = id);
    testCaseDelete(body).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testCaseDelete({
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    testCaseDelete({
      token: validToken,
      'id[0]': validIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem id[0]', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0],
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
        'id[0]': validIds[0]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas deleções rápidas (rate limit)', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    };
    const requests = Array(10).fill(0).map(() => testCaseDelete(body));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite deleções duplicadas rapidamente', () => {
    testCaseDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validIds[0]
    })
      .then(() => testCaseDelete({
        token: validToken,
        project_id: validProjectId,
        'id[0]': validIds[0]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});