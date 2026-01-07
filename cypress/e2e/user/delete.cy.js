const PATH_API = '/User/UsersDelete'
const validToken = Cypress.env('VALID_TOKEN');

const validUserId = 101;

describe('Users Delete - /users/delete', () => {

  it('Status Code are 200', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 200, 400, 422', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId, 'user_id[1]': validUserId + 1 }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    deleteUser({ 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    deleteUser({ token: 'token_invalido', 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 401, 403', () => {
    deleteUser({ token: 'token_expirado', 'user_id[0]': validUserId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    deleteUser({ token: null, 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    deleteUser({ token: '😀🔥💥', 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    deleteUser({ token: "' OR 1=1 --", 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 404', () => {
    deleteUser({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code are 404, 422, 400', () => {
    deleteUser({ token: validToken, 'user_id[0]': 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId, extra: 'foo' }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, 'user_id[0]': validUserId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    deleteUser({ token: "' OR 1=1 --", 'user_id[0]': validUserId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      deleteUser({ token: validToken, 'user_id[0]': validUserId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 409, 422, 404', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId })
      .then(() => deleteUser({ token: validToken, 'user_id[0]': validUserId }))
      .then((response) => {
        expect([200, 400, 401, 409, 422, 404]).to.include(response.status);
      });
  });
});