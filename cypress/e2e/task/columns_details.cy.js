const PATH_API = '/Task/columndetails'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validId = Cypress.env('VALID_ID');

describe('API rest - Task Columns Details - /task/columns/details', () => {

  function taskColumnsDetails(params, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: params,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Status Code 200', () => {
    taskColumnsDetails({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    taskColumnsDetails({ project_id: validProjectId, id: validId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      taskColumnsDetails({ token, project_id: validProjectId, id: validId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  it('Falha sem project_id', () => {
    taskColumnsDetails({ token: validToken, id: validId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      taskColumnsDetails({ token: validToken, project_id, id: validId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- id inválido, ausente, tipos errados, limites ---
  it('Falha sem id', () => {
    taskColumnsDetails({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      taskColumnsDetails({ token: validToken, project_id: validProjectId, id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Parâmetro extra ignorado ---
  it('Ignora parâmetro extra na query', () => {
    taskColumnsDetails({ token: validToken, project_id: validProjectId, id: validId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: { token: validToken, project_id: validProjectId, id: validId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type: não deve afetar GET (mas testando) ---
  it('GET ignora Content-Type application/json', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken, project_id: validProjectId, id: validId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskColumnsDetails({ token: "' OR 1=1 --", project_id: validProjectId, id: validId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    taskColumnsDetails({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskColumnsDetails({ token: validToken, project_id: validProjectId, id: validId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    taskColumnsDetails({ token: validToken, project_id: validProjectId, id: validId })
      .then(() => taskColumnsDetails({ token: validToken, project_id: validProjectId, id: validId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});