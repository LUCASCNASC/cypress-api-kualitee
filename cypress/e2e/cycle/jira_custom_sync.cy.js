const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/jira_custom_sync';

describe('API - Defects Jira Custom Sync - /defects/jira_custom_sync', () => {
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validPluginName = 'jira';
  
  function jiraCustomSync(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Sincroniza com Jira usando todos os campos obrigatórios válidos', () => {
    jiraCustomSync({
      token: validToken,
      project_id: validProjectId,
      plugin_name: validPluginName
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    jiraCustomSync({
      project_id: validProjectId,
      plugin_name: validPluginName
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      jiraCustomSync({
        token,
        project_id: validProjectId,
        plugin_name: validPluginName
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'plugin_name'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        plugin_name: validPluginName
      };
      delete body[field];
      jiraCustomSync(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      jiraCustomSync({
        token: validToken,
        project_id,
        plugin_name: validPluginName
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 0, -1, {}, [], true, false].forEach(plugin_name => {
    it(`Falha com plugin_name inválido (${JSON.stringify(plugin_name)})`, () => {
      jiraCustomSync({
        token: validToken,
        project_id: validProjectId,
        plugin_name
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    jiraCustomSync({
      token: validToken,
      project_id: validProjectId,
      plugin_name: validPluginName,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
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
          plugin_name: validPluginName
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
        plugin_name: validPluginName
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    jiraCustomSync({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      plugin_name: validPluginName
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    jiraCustomSync({
      token: validToken,
      project_id: validProjectId,
      plugin_name: validPluginName
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas sincronizações rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      jiraCustomSync({
        token: validToken,
        project_id: validProjectId,
        plugin_name: validPluginName
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita sincronizações idênticas sequenciais ---
  it('Permite sincronizações duplicadas rapidamente', () => {
    jiraCustomSync({
      token: validToken,
      project_id: validProjectId,
      plugin_name: validPluginName
    }).then(() =>
      jiraCustomSync({
        token: validToken,
        project_id: validProjectId,
        plugin_name: validPluginName
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});