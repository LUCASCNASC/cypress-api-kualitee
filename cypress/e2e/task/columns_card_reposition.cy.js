const PATH_API = '/Task/task%2Fcolumns%2Fcard%2Freposition';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validId = Cypress.env('VALID_ID');

describe('Task Columns Card Reposition - /task/columns/card/reposition', () => {

  it('Status Code is 200', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    taskColumnsCardReposition({ project_id: validProjectId, id: validId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    taskColumnsCardReposition({ token: validToken, id: validId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, id: validId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskColumnsCardReposition({ token: "' OR 1=1 --", project_id: validProjectId, id: validId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId })
      .then(() => taskColumnsCardReposition({ token: validToken, project_id: validProjectId, id: validId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});