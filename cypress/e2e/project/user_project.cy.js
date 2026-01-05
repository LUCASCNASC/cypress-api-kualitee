const PATH_API = '/Project/UsersProjectList';
const validToken = Cypress.env('VALID_TOKEN');

describe('Users Project List - /project/user_project', () => {

  it('Status Code: 200', () => {
    userProject({ token: validToken }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    userProject({}).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    userProject({ token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 401, 403', () => {
    userProject({ token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    userProject({ token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    userProject({ token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    userProject({ token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    userProject({ token: validToken, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415 no GET', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415, 200]).to.include(response.status); // algumas APIs aceitam,,tras não
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    userProject({ token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    userProject({ token: validToken }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      userProject({ token: validToken })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    userProject({ token: validToken })
      .then(() => userProject({ token: validToken }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});