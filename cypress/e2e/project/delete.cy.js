const PATH_API = '/Project/ProjectDelete';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('API rest - Project Delete - /project/delete', () => {

  function projectDelete(queryParams, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      qs: queryParams,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Status Code 200', () => {
    projectDelete({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha sem token', () => {
    projectDelete({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    projectDelete({ token: 'token_invalido', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    projectDelete({ token: 'token_expirado', project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    projectDelete({ token: null, project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    projectDelete({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      projectDelete({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    projectDelete({ token: validToken, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  
  it('Ignora campo extra nos parâmetros', () => {
    projectDelete({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: { token: validToken, project_id: validProjectId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      qs: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectDelete({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  
  it('Headers devem conter CORS e content-type', () => {
    projectDelete({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      projectDelete({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  
  it('Permite requisições duplicadas rapidamente', () => {
    projectDelete({ token: validToken, project_id: validProjectId })
      .then(() => projectDelete({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});