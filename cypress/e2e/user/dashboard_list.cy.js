const PATH_API = '/User/UsersListDashboard'
const validToken = Cypress.env('VALID_TOKEN');

describe('Users List Dashboard - /users/dashboard_list', () => {

  it('Status Code: 200', () => {
    dashboardList({ token: validToken }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('users').that.is.an('array');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardList({}).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardList({ token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code: 401, 403', () => {
    dashboardList({ token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardList({ token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardList({ token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    dashboardList({ token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    dashboardList({ token: validToken, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    dashboardList({ token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    dashboardList({ token: validToken }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      dashboardList({ token: validToken })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    dashboardList({ token: validToken })
      .then(() => dashboardList({ token: validToken }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});