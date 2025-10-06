// Testes automatizados para API: POST /test_scenario/create
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/Test%20Scenario/TestScenarioCreate'

describe('API - Test Scenario Create - /test_scenario/create', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validBuildId = Cypress.env('VALID_BUILD_ID');
  const validModuleId = 5;   // Opcional, se aplicável
  const validRequirementId = 88; // Opcional, se aplicável
  const validScenarioName = 'Novo Cenário de Teste';
  const validDescription = 'Descrição detalhada do cenário de teste';

  // Função utilitária para chamada da API
  function createTestScenario(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: obrigatórios apenas
  it('Cria cenário de teste com campos obrigatórios válidos', () => {
    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // POSITIVO: todos os campos
  it('Cria cenário de teste com todos os campos preenchidos', () => {
    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      requirement_id: validRequirementId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    createTestScenario({
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      createTestScenario({
        token,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  ['project_id', 'test_scenario_name', 'description'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      };
      delete body[field];
      createTestScenario(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos obrigatórios inválidos
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          test_scenario_name: validScenarioName,
          description: validDescription
        };
        body[field] = value;
        createTestScenario(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription,
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
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          test_scenario_name: validScenarioName,
          description: validDescription
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
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    createTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      createTestScenario({
        token: validToken,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite criar o mesmo cenário de teste rapidamente', () => {
    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    })
      .then(() => createTestScenario({
        token: validToken,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});