const PATH_API = '/Task/columnCreate'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validColumnName = 'Nova Coluna';

describe('Task Columns Create - /task/columns/create', () => {

  it('Status Code is 200', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    taskColumnsCreate({ project_id: validProjectId, column_name: validColumnName }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    taskColumnsCreate({ token: validToken, column_name: validColumnName }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, column_name: validColumnName },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskColumnsCreate({ token: "' OR 1=1 --", project_id: validProjectId, column_name: validColumnName }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName })
      .then(() => taskColumnsCreate({ token: validToken, project_id: validProjectId, column_name: validColumnName }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});