const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/Activities';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validId = Cypress.env('VALID_ID');

describe('Dashboard - Dashboard Activities - /dashboard/activities', () => {

  it('Status Code: 200', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 200', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, id: validId, show: 'me' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardActivities({ project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardActivities({ token: 'token_invalido', project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 401, 403', () => {
    dashboardActivities({ token: 'token_expirado', project_id: validProjectId, show: 'all' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardActivities({ token: null, project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardActivities({ token: '😀🔥💥', project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardActivities({ token: "' OR 1=1 --", project_id: validProjectId, show: 'all' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    dashboardActivities({ token: validToken, show: 'all' }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 404, 422, 400', () => {
    dashboardActivities({ token: validToken, project_id: 999999, show: 'all' }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all', extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, show: 'all' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    dashboardActivities({ token: "' OR 1=1 --", project_id: validProjectId, show: 'all' }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Status Code: 429', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' })
      .then(() => dashboardActivities({ token: validToken, project_id: validProjectId, show: 'all' }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});