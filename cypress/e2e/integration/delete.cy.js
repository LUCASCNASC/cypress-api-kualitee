const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Integration/Delete';

const validId = Cypress.env('VALID_ID');

const validPluginName = 'JIRA';
const validUsername = 'usuario_teste';
const validPassword = 'senha_teste';
const validPluginUrl = 'https://jira.example.com';

describe('API rest - Integration - Integration Save - /integration/save', () => {

  it('Status Code 200', () => {
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