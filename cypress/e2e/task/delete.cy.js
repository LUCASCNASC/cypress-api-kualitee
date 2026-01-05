const PATH_API = '/Task/Delete'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validId = Cypress.env('VALID_ID');

describe('Task Delete - /task/delete', () => {

  it('Status Code: 200', () => {
    taskDelete({ token: validToken, project_id: validProjectId, 'id[0]': validId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    taskDelete({ project_id: validProjectId, 'id[0]': validId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    taskDelete({ token: validToken, 'id[0]': validId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    taskDelete({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    taskDelete({ token: validToken, project_id: validProjectId, 'id[0]': validId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, 'id[0]': validId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskDelete({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    taskDelete({ token: validToken, project_id: validProjectId, 'id[0]': validId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      taskDelete({ token: validToken, project_id: validProjectId, 'id[0]': validId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    taskDelete({ token: validToken, project_id: validProjectId, 'id[0]': validId })
      .then(() => taskDelete({ token: validToken, project_id: validProjectId, 'id[0]': validId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});