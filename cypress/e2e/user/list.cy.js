const PATH_API = '/User/UsersLists'
const validToken = Cypress.env('VALID_TOKEN');

describe('Users List - /users/list', () => {

  it('Status Code is 400, 401, 403', () => {
    listUsers({}).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    listUsers({ token: 'token_invalido' }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });
  });

  it('Status Code is 401, 403', () => {
    listUsers({ token: 'token_expirado' }).then((response) => {
      expect([401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    listUsers({ token: null }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    listUsers({ token: validToken, user_status: 0, extra: 'foo' }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    listUsers({ token: '😀🔥💥', user_status: 0 }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    listUsers({ token: "' OR 1=1 --", user_status: 0 }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, user_status: 0 },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    listUsers({ token: "' OR 1=1 --", user_status: 0 }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    listUsers({ token: validToken, user_status: 0 }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() => listUsers({ token: validToken, user_status: 0 }));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    listUsers({ token: validToken, user_status: 0 })
      .then(() => listUsers({ token: validToken, user_status: 0 }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});