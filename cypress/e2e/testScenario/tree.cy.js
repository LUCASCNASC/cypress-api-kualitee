// Testes automatizados para API: POST /test_scenario/tree
// Segue o padrão dos testes Cypress do projeto

describe('API - Test Scenario Tree - /test_scenario/tree', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente

  // Função utilitária para chamada da API
  function testScenarioTree(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Test%20Scenario/GetTestScenarioTree`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: obrigatórios apenas
  it('Retorna a árvore de cenários de teste com campos obrigatórios válidos', () => {
    testScenarioTree({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    testScenarioTree({
      project_id: validProjectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testScenarioTree({
        token,
        project_id: validProjectId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  it('Falha sem project_id', () => {
    testScenarioTree({
      token: validToken
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // project_id inválido
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(value => {
    it(`Falha com project_id inválido (${JSON.stringify(value)})`, () => {
      testScenarioTree({
        token: validToken,
        project_id: value
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    testScenarioTree({
      token: validToken,
      project_id: validProjectId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // HTTP Method errado
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Test%20Scenario/GetTestScenarioTree`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // Content-Type errado
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/Test%20Scenario/GetTestScenarioTree`,
      body: {
        token: validToken,
        project_id: validProjectId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testScenarioTree({
      token: "' OR 1=1 --",
      project_id: validProjectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    testScenarioTree({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      testScenarioTree({
        token: validToken,
        project_id: validProjectId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite chamadas idênticas rapidamente', () => {
    testScenarioTree({
      token: validToken,
      project_id: validProjectId
    })
      .then(() => testScenarioTree({
        token: validToken,
        project_id: validProjectId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});