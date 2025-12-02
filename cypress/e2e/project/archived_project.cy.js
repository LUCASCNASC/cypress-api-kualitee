const PATH_API = '/Project/ArchivedProjects';
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Archived Projects - /project/archived_projects', () => {

  function archivedProjects(body, options = {}) {
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
    archivedProjects({ token: validToken }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha sem token', () => {
    archivedProjects({}).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    archivedProjects({ token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    archivedProjects({ token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    archivedProjects({ token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    archivedProjects({ token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    archivedProjects({ token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  
  it('Ignora campo extra no body', () => {
    archivedProjects({ token: validToken, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken },
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
      body: { token: validToken },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    archivedProjects({ token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  
  it('Headers devem conter CORS e content-type', () => {
    archivedProjects({ token: validToken }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      archivedProjects({ token: validToken })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  
  it('Permite requisições duplicadas rapidamente', () => {
    archivedProjects({ token: validToken })
      .then(() => archivedProjects({ token: validToken }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});