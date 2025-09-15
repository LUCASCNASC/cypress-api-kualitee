// Testes automatizados para API: POST /test_case/tree_testcase_in_modules
// Segue o padrão dos testes Cypress do projeto

describe('API - Test Case Tree in Modules - /test_case/tree_testcase_in_modules', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validModuleId = 5;   // Substitua por um module_id válido do seu ambiente

  // Função utilitária para chamada da API
  function testCaseTreeInModules(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/TestCase/TreeTestCaseInModules`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: todos os campos obrigatórios válidos ---
  it('Retorna árvore de casos de teste em módulos com token, project_id e module_id válidos', () => {
    testCaseTreeInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    testCaseTreeInModules({
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testCaseTreeInModules({
        token,
        project_id: validProjectId,
        module_id: validModuleId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campo obrigatório ausente ---
  ['project_id', 'module_id'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      };
      delete body[field];
      testCaseTreeInModules(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'module_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          module_id: validModuleId
        };
        body[field] = value;
        testCaseTreeInModules(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    testCaseTreeInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
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
        url: `${BASE_URL}/TestCase/TreeTestCaseInModules`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          module_id: validModuleId
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
      url: `${BASE_URL}/TestCase/TreeTestCaseInModules`,
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

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseTreeInModules({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    testCaseTreeInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      testCaseTreeInModules({
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

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    testCaseTreeInModules({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId
    })
      .then(() => testCaseTreeInModules({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});