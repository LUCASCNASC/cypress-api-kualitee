const PATH_API = '/User/UserUpdate'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Users Update - /users/update', () => {


  it('Status Code is 200', () => {

    const { street_1, street_2, city, country, zipcode, ...bodyMin } = validBody;
    updateUser({ ...bodyMin, profile_username: 'updateuser' + Date.now(), email: `min${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Falha sem token', () => {

    const { token, ...body } = validBody;
    updateUser(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {

    updateUser({ ...validBody, token: 'token_invalido', profile_username: 'updateuser' + Date.now(), email: `inv${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {

    updateUser({ ...validBody, token: 'token_expirado', profile_username: 'updateuser' + Date.now(), email: `exp${Date.now()}@test.com` }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {

    updateUser({ ...validBody, token: null, profile_username: 'updateuser' + Date.now(), email: `null${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {

    updateUser({ ...validBody, token: '😀🔥💥', profile_username: 'updateuser' + Date.now(), email: `emoji${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {

    updateUser({ ...validBody, token: "' OR 1=1 --", profile_username: 'updateuser' + Date.now(), email: `sqli${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {

    updateUser({ ...validBody, extra: 'bar', profile_username: 'updateuser' + Date.now(), email: `extra${Date.now()}@test.com` }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Falha com Content-Type application/json', () => {

    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { ...validBody, profile_username: 'updateuser' + Date.now(), email: `ct${Date.now()}@test.com` },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    updateUser({ ...validBody, token: "' OR 1=1 --", profile_username: 'updateuser' + Date.now(), email: `sec${Date.now()}@test.com` }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {

    updateUser({ ...validBody, profile_username: 'updateuser' + Date.now(), email: `hdr${Date.now()}@test.com` }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {

    const requests = Array(10).fill(0).map(() =>
      updateUser({ ...validBody, profile_username: 'updateuser' + Math.random(), email: `rl${Math.random()}@test.com` })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Falha ao atualizar usuário com email já existente em outro usuário', () => {

    const uniqueEmail = `dup${Date.now()}@test.com`;
    const uniqueUsername = 'updateuser' + Date.now();
    updateUser({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername, user_id: validBody.user_id }).then(() => {

      updateUser({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername, user_id: validBody.user_id + 1 }).then((response) => {
        expect([400, 409, 422]).to.include(response.status);
      });
    });
  });
});