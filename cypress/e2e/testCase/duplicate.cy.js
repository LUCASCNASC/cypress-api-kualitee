const PATH_API = '/TestCase/duplicate';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTestCaseName = 'TC001'; 

describe('API rest - Duplicate Test Case - /test_case/duplicate', () => {

  function duplicateTestCase(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: todos os campos obrigatórios válidos ---
  it('Duplica caso de teste com token, project_id e tc_name válidos', () => {
    duplicateTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_name: validTestCaseName
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    duplicateTestCase({
      project_id: validProjectId,
      tc_name: validTestCaseName
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      duplicateTestCase({
        token,
        project_id: validProjectId,
        tc_name: validTestCaseName
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campo obrigatório ausente ---
  ['project_id', 'tc_name'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        tc_name: validTestCaseName
      };
      delete body[field];
      duplicateTestCase(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          tc_name: validTestCaseName
        };
        body[field] = value;
        duplicateTestCase(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  ['tc_name'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          tc_name: validTestCaseName
        };
        body[field] = value;
        duplicateTestCase(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    duplicateTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_name: validTestCaseName,
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
          tc_name: validTestCaseName
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
        tc_name: validTestCaseName
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    duplicateTestCase({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_name: validTestCaseName
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    duplicateTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_name: validTestCaseName
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      duplicateTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_name: validTestCaseName
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite duplicar o mesmo caso de teste rapidamente', () => {
    duplicateTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_name: validTestCaseName
    })
      .then(() => duplicateTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_name: validTestCaseName
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});