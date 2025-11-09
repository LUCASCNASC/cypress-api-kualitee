const PATH_API = '/Test%20Scenario/TestScenarioDetail'
const validToken = Cypress.env('VALID_TOKEN');
const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validTestScenarioId = 99;

describe('API - Test Scenario Detail - /test_scenario/details', () => {

  function getTestScenarioDetails(params, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: params,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: todos os campos obrigatórios válidos
  it('Retorna detalhes do cenário de teste com token, project_id e test_scenario_id válidos', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    getTestScenarioDetails({
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      getTestScenarioDetails({
        token,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  ['project_id', 'test_scenario_id'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const params = {
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
      };
      delete params[field];
      getTestScenarioDetails(params).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos obrigatórios inválidos
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'test_scenario_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const params = {
          token: validToken,
          project_id: validProjectId,
          test_scenario_id: validTestScenarioId,
        };
        params[field] = value;
        getTestScenarioDetails(params).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // Campos extras
  it('Ignora campo extra na query string', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // HTTP Method errado
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: {
          token: validToken,
          project_id: validProjectId,
          test_scenario_id: validTestScenarioId,
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // Content-Type sempre application/json
  it('Content-Type deve ser application/json', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    getTestScenarioDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      getTestScenarioDetails({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite chamadas idênticas rapidamente', () => {
    getTestScenarioDetails({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
    })
      .then(() => getTestScenarioDetails({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});