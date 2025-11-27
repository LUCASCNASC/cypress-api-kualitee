const PATH_API = '/TestCase/Copy';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestcaseIds = [1001, 1002];  

describe('API rest - Test Case Copy - /test_case/copy_test_case', () => {

  function testCaseCopy(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: Copiar um caso de teste ---
  it('Copia um caso de teste', () => {
    testCaseCopy({
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

  // --- POSITIVO: Copiar múltiplos casos de teste ---
  it('Copia múltiplos casos de teste', () => {
    const body = {
      token: validToken,
      project_id: validProjectId
    };
    validTestcaseIds.forEach((id, i) => body[`testcase_id[${i}]`] = id);
    testCaseCopy(body).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    testCaseCopy({
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testCaseCopy({
        token,
        project_id: validProjectId,
        'testcase_id[0]': validTestcaseIds[0]
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campo obrigatório ausente ---
  it('Falha sem project_id', () => {
    testCaseCopy({
      token: validToken,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem testcase_id[0]', () => {
    testCaseCopy({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'testcase_id[0]'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          'testcase_id[0]': validTestcaseIds[0]
        };
        body[field] = value;
        testCaseCopy(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    testCaseCopy({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0],
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          'testcase_id[0]': validTestcaseIds[0]
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
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

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseCopy({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    testCaseCopy({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas cópias rápidas (rate limit)', () => {
    const body = {
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    };
    const requests = Array(10).fill(0).map(() => testCaseCopy(body));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita cópias idênticas sequenciais ---
  it('Permite cópias duplicadas rapidamente', () => {
    testCaseCopy({
      token: validToken,
      project_id: validProjectId,
      'testcase_id[0]': validTestcaseIds[0]
    })
      .then(() => testCaseCopy({
        token: validToken,
        project_id: validProjectId,
        'testcase_id[0]': validTestcaseIds[0]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});