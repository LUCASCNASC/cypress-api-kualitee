const PATH_API = '/User/UserDetail'
const validToken = Cypress.env('VALID_TOKEN');

const validUserId = 101;

describe('API rest - User Detail - /users/detail', () => {

  it('Status Code is 200', () => {
    getUserDetail({ token: validToken, user_id: validUserId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('user').that.is.an('object');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    getUserDetail({ user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    getUserDetail({ token: 'token_invalido', user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    getUserDetail({ token: 'token_expirado', user_id: validUserId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    getUserDetail({ token: null, user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    getUserDetail({ token: '😀🔥💥', user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    getUserDetail({ token: "' OR 1=1 --", user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem user_id', () => {
    getUserDetail({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com user_id inexistente', () => {
    getUserDetail({ token: validToken, user_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Ignora campo extra na query', () => {
    getUserDetail({ token: validToken, user_id: validUserId, extra: 'foo' }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Falha com Content-Type application/x-www-form-urlencoded', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken, user_id: validUserId },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    getUserDetail({ token: "' OR 1=1 --", user_id: validUserId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    getUserDetail({ token: validToken, user_id: validUserId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      getUserDetail({ token: validToken, user_id: validUserId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    getUserDetail({ token: validToken, user_id: validUserId })
      .then(() => getUserDetail({ token: validToken, user_id: validUserId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});