const PATH_API = '/TestCase/Template';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestcaseIds = [1001, 1002];

describe('API rest - Test Case Template - /test_case/template_test_case', () => {

  it('Status Code is 200', () => {
    testCaseTemplate({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Gera template para múltiplos casos de teste', () => {
    const body = {
      token: validToken,
      project_id: validProjectId
    };
    validTestcaseIds.forEach((id, i) => body[`testcase_id[${i}]`] = id);
    testCaseTemplate(body).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    testCaseTemplate({
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    testCaseTemplate({
      token: validToken,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem testcase_id[0]', () => {
    testCaseTemplate({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    testCaseTemplate({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0],
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'testcase_id[0]': validTestcaseIds[0]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseTemplate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    testCaseTemplate({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    };
    const requests = Array(10).fill(0).map(() => testCaseTemplate(body));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite gerar templates duplicados rapidamente', () => {
    testCaseTemplate({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    })
      .then(() => testCaseTemplate({
        token: validToken,
        project_id: validProjectId,
        'testcase_id[0]': validTestcaseIds[0]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});