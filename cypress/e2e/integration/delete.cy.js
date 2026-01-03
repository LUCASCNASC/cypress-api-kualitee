const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Integration/Delete';

const validId = Cypress.env('VALID_ID');

const validPluginName = 'JIRA';
const validUsername = 'usuario_teste';
const validPassword = 'senha_teste';
const validPluginUrl = 'https://jira.example.com';

describe('Integration - Integration Save - /integration/save', () => {

  it('Status Code is 200', () => {
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

  it('Status Code is 400, 401, 403', () => {
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

  it('Status Code is 400, 422, 404', () => {
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

  it('Status Code is 400, 422, 404', () => {
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

  it('Status Code is 400, 422, 404', () => {
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

  it('Status Code is 400, 422, 404', () => {
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

  it('Status Code is 400, 422, 404', () => {
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

  it('Status Code is 200', () => {
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

  it('Status Code is 400, 415', () => {
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
  
  it('Status Code is 429', () => {
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

  it('Status Code is 429', () => {
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

  it('Status Code is 200, 400, 401, 409', () => {
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