// Testes automatizados para API: POST /test_scenario/delete
// Segue o padrão dos testes Cypress do projeto

describe('API - Test Scenario Delete - /test_scenario/delete', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validTestScenarioId = 99; // Substitua por um test_scenario_id válido do seu ambiente

  // Função utilitária para chamada da API
  function deleteTestScenario(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Test%20Scenario/TestScenarioDelete`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: todos os campos obrigatórios válidos
  it('Deleta cenário de teste com token, project_id e test_scenario_id válidos', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    deleteTestScenario({
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      deleteTestScenario({
        token,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  ['project_id', 'test_scenario_id[0]'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      };
      delete body[field];
      deleteTestScenario(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos obrigatórios inválidos
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'test_scenario_id[0]'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          'test_scenario_id[0]': validTestScenarioId
        };
        body[field] = value;
        deleteTestScenario(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId,
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
        url: `${BASE_URL}/Test%20Scenario/TestScenarioDelete`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          'test_scenario_id[0]': validTestScenarioId
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
      url: `${BASE_URL}/Test%20Scenario/TestScenarioDelete`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    deleteTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      deleteTestScenario({
        token: validToken,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite deletar o mesmo cenário rapidamente', () => {
    deleteTestScenario({
      token: validToken,
      project_id: validProjectId,
      'test_scenario_id[0]': validTestScenarioId
    })
      .then(() => deleteTestScenario({
        token: validToken,
        project_id: validProjectId,
        'test_scenario_id[0]': validTestScenarioId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});