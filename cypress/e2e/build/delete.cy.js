const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Build/BuildsDelete';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

describe('API rest - Build - Builds Delete - /build/delete', () => {

  function buildDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  it('Status Code 200', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha sem token', () => {
    buildDelete({
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    buildDelete({
      token: 'token_invalido',
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    buildDelete({
      token: 'token_expirado',
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    buildDelete({
      token: null,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });
  
  it('Falha sem project_id', () => {
    buildDelete({
      token: validToken,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem build_id[0]', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha com project_id inexistente', () => {
    buildDelete({
      token: validToken,
      project_id: 999999,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Falha com build_id[0] inexistente', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': 999999
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });
  
  it('Ignora campo extra no body', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId,
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
        project_id: validProjectId,
        'build_id[0]': validBuildId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    buildDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      buildDelete({
        token: validToken,
        project_id: validProjectId,
        'build_id[0]': validBuildId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Permite requisições duplicadas rapidamente', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    })
      .then(() => buildDelete({
        token: validToken,
        project_id: validProjectId,
        'build_id[0]': validBuildId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});