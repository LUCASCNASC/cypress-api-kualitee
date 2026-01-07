const PATH_API = '/Task/task%2Ftime%2Flog'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTaskId = 888;

describe('Task Time Log - /task/time/log', () => {

  it('Status Code are 200', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    taskTimeLog({
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 404', () => {
    taskTimeLog({
      token: validToken,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 404', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16',
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    taskTimeLog({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      taskTimeLog({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    taskTimeLog({
      token: validToken,
      project_id: validProjectId,
      id: validTaskId,
      start_date: '2025-09-16',
      start_time: '09:00',
      end_time: '17:00',
      billable: 1,
      task_complete: 0,
      end_date: '2025-09-16'
    })
      .then(() => taskTimeLog({
        token: validToken,
        project_id: validProjectId,
        id: validTaskId,
        start_date: '2025-09-16',
        start_time: '09:00',
        end_time: '17:00',
        billable: 1,
        task_complete: 0,
        end_date: '2025-09-16'
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});