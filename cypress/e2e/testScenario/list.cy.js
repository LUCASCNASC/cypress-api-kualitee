// Testes automatizados para API: POST /test_scenario/list
// Segue o padrão dos testes Cypress do projeto

describe('API - Test Scenario List - /test_scenario/list', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validBuildId = 12;   // Opcional, se aplicável
  const validModuleId = 5;   // Opcional, se aplicável
  const validRequirementId = 88; // Opcional, se aplicável
  const validCreatedBy = [123];  // Opcional, se aplicável

  // Função utilitária para chamada da API
  function testScenarioList(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/Test%20Scenario/TestScenarioList',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: Somente obrigatórios
  it('Retorna lista de cenários de teste com token e project_id válidos', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // POSITIVO: Todos os parâmetros
  it('Retorna lista de cenários de teste com todos os parâmetros', () => {
    testScenarioList({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      requirement_id: validRequirementId,
      created_by: validCreatedBy,
      export: 'yes',
      export_type: 'CSV'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    testScenarioList({
      project_id: validProjectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testScenarioList({
        token,
        project_id: validProjectId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  it('Falha sem project_id', () => {
    testScenarioList({
      token: validToken
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // project_id inválido
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(value => {
    it(`Falha com project_id inválido (${JSON.stringify(value)})`, () => {
      testScenarioList({
        token: validToken,
        project_id: value
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // created_by array inválido
  [null, '', 'abc', 0, -1, {}, true, false].forEach(value => {
    it(`Falha com created_by inválido (${JSON.stringify(value)})`, () => {
      testScenarioList({
        token: validToken,
        project_id: validProjectId,
        created_by: value
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // export_type inválido
  ['PDF', 123, {}, [], true, false].forEach(value => {
    it(`Falha com export_type inválido (${JSON.stringify(value)})`, () => {
      testScenarioList({
        token: validToken,
        project_id: validProjectId,
        export: 'yes',
        export_type: value
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    testScenarioList({
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
        url: '/Test%20Scenario/TestScenarioList',
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
      url: '/Test%20Scenario/TestScenarioList',
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
    testScenarioList({
      token: "' OR 1=1 --",
      project_id: validProjectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    testScenarioList({
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
      testScenarioList({
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
    testScenarioList({
      token: validToken,
      project_id: validProjectId
    })
      .then(() => testScenarioList({
        token: validToken,
        project_id: validProjectId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});