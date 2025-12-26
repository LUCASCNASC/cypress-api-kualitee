const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Meta/Create';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validIds = Cypress.env('VALID_IDS');

describe('API rest - Metas Delete - /metas/delete', () => {

  it('Status Code is 200', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 200', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0] }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 401 ou 403', () => {
    metasDelete({ project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422 ou 404', () => {
    metasDelete({ token: validToken, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422 ou 404', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200, 400, 422 ou 404', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0] }).then(response => {
      // Se o endpoint permitir apenas um id, pode passar, senão deve falhar
      expect([200, 400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1], extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasDelete({ token: "' OR 1=1 --", project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401 ou 409', () => {
    metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] })
      .then(() => metasDelete({ token: validToken, project_id: validProjectId, 'ids[0]': validIds[0], 'ids[1]': validIds[1] }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});