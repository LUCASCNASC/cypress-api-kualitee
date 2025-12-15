const PATH_API = '/Task/task%2Ftime%2Flog%2Fdetail'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTaskId = 888;

describe('API rest - Task Time Log Detail - /task/time/log/detail', () => {

  it('Status Code 200', () => {
    taskTimeLogDetail({ token: validToken, project_id: validProjectId, id: validTaskId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    taskTimeLogDetail({ project_id: validProjectId, id: validTaskId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    taskTimeLogDetail({ token: validToken, id: validTaskId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem id', () => {
    taskTimeLogDetail({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora parâmetro extra na query', () => {
    taskTimeLogDetail({ token: validToken, project_id: validProjectId, id: validTaskId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('GET ignora Content-Type application/json', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken, project_id: validProjectId, id: validTaskId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskTimeLogDetail({ token: "' OR 1=1 --", project_id: validProjectId, id: validTaskId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    taskTimeLogDetail({ token: validToken, project_id: validProjectId, id: validTaskId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      taskTimeLogDetail({ token: validToken, project_id: validProjectId, id: validTaskId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    taskTimeLogDetail({ token: validToken, project_id: validProjectId, id: validTaskId })
      .then(() => taskTimeLogDetail({ token: validToken, project_id: validProjectId, id: validTaskId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});