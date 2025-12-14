const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Meta/Update';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validId = Cypress.env('VALID_ID');

const validMetaKey = 'browser';
const validMetaValue = 'chrome';

describe('API rest - Metas Update - /metas/update', () => {

  it('Status Code 200', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza meta com meta_key válido', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_key: validMetaKey, meta_value: validMetaValue }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha sem token', () => {
    metasUpdate({ project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    metasUpdate({ token: validToken, id: validId, meta_value: validMetaValue }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem id', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, meta_value: validMetaValue }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem meta_value', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasUpdate({ token: "' OR 1=1 --", project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue })
      .then(() => metasUpdate({ token: validToken, project_id: validProjectId, id: validId, meta_value: validMetaValue }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});