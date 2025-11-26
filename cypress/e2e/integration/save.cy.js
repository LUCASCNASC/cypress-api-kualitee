const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Integration/save';

const validId = Cypress.env('VALID_ID');

const validPluginName = 'JIRA';
const validUsername = 'usuario_teste';
const validPassword = 'senha_teste';
const validPluginUrl = 'https://jira.example.com';

describe('API - Integration Save - /integration/save', () => {

  function integrationSave(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Salva integração com todos os campos obrigatórios válidos', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    integrationSave({
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      integrationSave({
        token,
        plugin_name: validPluginName,
        username: validUsername,
        password: validPassword,
        plugin_url: validPluginUrl,
        id: validId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- plugin_name inválido, ausente, tipos errados, limites ---
  it('Falha sem plugin_name', () => {
    integrationSave({
      token: validToken,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(plugin_name => {
    it(`Falha com plugin_name inválido (${JSON.stringify(plugin_name)})`, () => {
      integrationSave({
        token: validToken,
        plugin_name,
        username: validUsername,
        password: validPassword,
        plugin_url: validPluginUrl,
        id: validId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- username inválido, ausente, tipos errados, limites ---
  it('Falha sem username', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(username => {
    it(`Falha com username inválido (${JSON.stringify(username)})`, () => {
      integrationSave({
        token: validToken,
        plugin_name: validPluginName,
        username,
        password: validPassword,
        plugin_url: validPluginUrl,
        id: validId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- password inválido, ausente, tipos errados, limites ---
  it('Falha sem password', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(password => {
    it(`Falha com password inválido (${JSON.stringify(password)})`, () => {
      integrationSave({
        token: validToken,
        plugin_name: validPluginName,
        username: validUsername,
        password,
        plugin_url: validPluginUrl,
        id: validId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- plugin_url inválido, ausente, tipos errados, limites ---
  it('Falha sem plugin_url', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      id: validId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(plugin_url => {
    it(`Falha com plugin_url inválido (${JSON.stringify(plugin_url)})`, () => {
      integrationSave({
        token: validToken,
        plugin_name: validPluginName,
        username: validUsername,
        password: validPassword,
        plugin_url,
        id: validId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- id inválido, ausente, tipos errados, limites ---
  it('Falha sem id', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      integrationSave({
        token: validToken,
        plugin_name: validPluginName,
        username: validUsername,
        password: validPassword,
        plugin_url: validPluginUrl,
        id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId,
      extra: 'foo'
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
          plugin_name: validPluginName,
          username: validUsername,
          password: validPassword,
          plugin_url: validPluginUrl,
          id: validId
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
        plugin_name: validPluginName,
        username: validUsername,
        password: validPassword,
        plugin_url: validPluginUrl,
        id: validId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    integrationSave({
      token: "' OR 1=1 --",
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      integrationSave({
        token: validToken,
        plugin_name: validPluginName,
        username: validUsername,
        password: validPassword,
        plugin_url: validPluginUrl,
        id: validId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    integrationSave({
      token: validToken,
      plugin_name: validPluginName,
      username: validUsername,
      password: validPassword,
      plugin_url: validPluginUrl,
      id: validId
    })
      .then(() => integrationSave({
        token: validToken,
        plugin_name: validPluginName,
        username: validUsername,
        password: validPassword,
        plugin_url: validPluginUrl,
        id: validId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});