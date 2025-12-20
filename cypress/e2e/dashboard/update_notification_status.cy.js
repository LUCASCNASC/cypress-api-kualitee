const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/UpdateNotificationStatus';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validIds = Cypress.env('VALID_IDS');

describe('API rest - Dashboard - Dashboard Update Notification Status - /dashboard/update_notification_status', () => {

  it('Status Code 200', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code 400, 401, 403', () => {
    updateNotificationStatus({ project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 401, 403', () => {
    updateNotificationStatus({ token: 'token_invalido', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 401, 403', () => {
    updateNotificationStatus({ token: 'token_expirado', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 401, 403', () => {
    updateNotificationStatus({ token: null, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 401, 403', () => {
    updateNotificationStatus({ token: '😀🔥💥', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 401, 403', () => {
    updateNotificationStatus({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 422, 404', () => {
    updateNotificationStatus({ token: validToken, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code 404, 422, 400', () => {
    updateNotificationStatus({ token: validToken, project_id: 999999, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code 200', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1], extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    updateNotificationStatus({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Status Code 429', () => {
    const requests = Array(10).fill(0).map(() =>
      updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code 200, 400, 401, 409', () => {
    updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
      .then(() => updateNotificationStatus({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});