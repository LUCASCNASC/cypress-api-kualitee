// Testes automatizados para API: POST /test_scenario/update
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/Test%20Scenario/PostTestScenarioUpdate'

describe('API - Test Scenario Update - /test_scenario/update', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validTestScenarioId = 99; // Substitua por um test_scenario_id válido do seu ambiente
  const validBuildId = 12;   // Opcional, se aplicável
  const validModuleId = 5;   // Opcional, se aplicável
  const validRequirementId = 88; // Opcional, se aplicável
  const validScenarioName = 'Cenário Atualizado';
  const validDescription = 'Descrição atualizada do cenário de teste';

  // Função utilitária para chamada da API
  function updateTestScenario(body, options = {}) {
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
  it('Atualiza cenário de teste com campos obrigatórios válidos', () => {
    updateTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
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
  it('Atualiza cenário de teste com todos os campos preenchidos', () => {
    updateTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
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
    updateTestScenario({
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      updateTestScenario({
        token,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
        test_scenario_name: validScenarioName,
        description: validDescription
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  ['project_id', 'test_scenario_id', 'test_scenario_name', 'description'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
        test_scenario_name: validScenarioName,
        description: validDescription
      };
      delete body[field];
      updateTestScenario(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos obrigatórios inválidos
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'test_scenario_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          test_scenario_id: validTestScenarioId,
          test_scenario_name: validScenarioName,
          description: validDescription
        };
        body[field] = value;
        updateTestScenario(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    updateTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
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
          test_scenario_id: validTestScenarioId,
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
        test_scenario_id: validTestScenarioId,
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
    updateTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    updateTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
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
      updateTestScenario({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
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
  it('Permite atualizar o mesmo cenário rapidamente', () => {
    updateTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_id: validTestScenarioId,
      test_scenario_name: validScenarioName,
      description: validDescription
    })
      .then(() => updateTestScenario({
        token: validToken,
        project_id: validProjectId,
        test_scenario_id: validTestScenarioId,
        test_scenario_name: validScenarioName,
        description: validDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});