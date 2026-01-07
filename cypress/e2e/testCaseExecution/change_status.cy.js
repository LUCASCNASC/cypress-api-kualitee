const PATH_API = '/Test%20Case%20Execution/ChangeStatus'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validStatus = 'Passed';
const validTcIds = [101, 102, 103];

describe('Test Case Execution Change Status - /test_case_execution/change_status', () => {

  it('Status Code are 200', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    changeStatus({
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 404', () => {
    changeStatus({
      token: validToken,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2],
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
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    changeStatus({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      changeStatus({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    })
      .then(() => changeStatus({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});