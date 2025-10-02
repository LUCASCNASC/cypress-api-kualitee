// Testes automatizados para API: POST /test_scenario/export_csv
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/Test%20Scenario/ExportCSV'

describe('API - Test Scenario Export CSV - /test_scenario/export_csv', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validExportTypes = ['CSV', 'Excel', 'Word'];

  // Função utilitária para chamada da API
  function exportTestScenario(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: todos export_types válidos
  validExportTypes.forEach(export_type => {
    it(`Exporta cenários de teste como ${export_type}`, () => {
      exportTestScenario({
        token: validToken,
        project_id: validProjectId,
        export_type
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    exportTestScenario({
      project_id: validProjectId,
      export_type: 'CSV'
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      exportTestScenario({
        token,
        project_id: validProjectId,
        export_type: 'CSV'
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  ['project_id', 'export_type'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        export_type: 'CSV'
      };
      delete body[field];
      exportTestScenario(body).then(response => {
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
          export_type: 'CSV'
        };
        body[field] = value;
        exportTestScenario(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // export_type inválido
  ['PDF', 123, {}, [], true, false].forEach(export_type => {
    it(`Falha com export_type inválido (${JSON.stringify(export_type)})`, () => {
      exportTestScenario({
        token: validToken,
        project_id: validProjectId,
        export_type
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    exportTestScenario({
      token: validToken,
      project_id: validProjectId,
      export_type: 'CSV',
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
          export_type: 'CSV'
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
        export_type: 'CSV'
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    exportTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      export_type: 'CSV'
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    exportTestScenario({
      token: validToken,
      project_id: validProjectId,
      export_type: 'CSV'
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      exportTestScenario({
        token: validToken,
        project_id: validProjectId,
        export_type: 'CSV'
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite chamadas idênticas rapidamente', () => {
    exportTestScenario({
      token: validToken,
      project_id: validProjectId,
      export_type: 'CSV'
    })
      .then(() => exportTestScenario({
        token: validToken,
        project_id: validProjectId,
        export_type: 'CSV'
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});