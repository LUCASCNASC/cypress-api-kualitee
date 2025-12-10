const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/Activities';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validId = Cypress.env('VALID_ID');

describe('API rest - Dashboard - Dashboard Activities - /dashboard/activities', () => {
  
  function dashboardActivities(body, options = {}) {
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
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna atividades filtrando por id', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, id: validId, show: 'me' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });
  
  it('Falha sem token', () => {
    dashboardActivities({ project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    dashboardActivities({ token: 'token_invalido', project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    dashboardActivities({ token: 'token_expirado', project_id: validProjectId, show: 'all' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    dashboardActivities({ token: null, project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    dashboardActivities({ token: '😀🔥💥', project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    dashboardActivities({ token: "' OR 1=1 --", project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });
  
  it('Falha sem project_id', () => {
    dashboardActivities({ token: validToken, show: 'all' }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      dashboardActivities({ token: validToken, project_id, show: 'all' }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    dashboardActivities({ token: validToken, project_id: 999999, show: 'all' }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(invalidId => {
    it(`Falha com id inválido (${JSON.stringify(invalidId)})`, () => {
      dashboardActivities({ token: validToken, project_id: validProjectId, id: invalidId, show: 'me' }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha sem show', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  ['invalid', '', null, 123, {}, [], true, false].forEach(invalidShow => {
    it(`Falha com show inválido (${JSON.stringify(invalidShow)})`, () => {
      dashboardActivities({ token: validToken, project_id: validProjectId, show: invalidShow }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });
  
  it('Ignora campo extra no body', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all', extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });
  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, project_id: validProjectId, show: 'all' },
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
      body: { token: validToken, project_id: validProjectId, show: 'all' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    dashboardActivities({ token: "' OR 1=1 --", project_id: validProjectId, show: 'all' }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Permite requisições duplicadas rapidamente', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' })
      .then(() => dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});