const PATH_API = '/User/UsersCreate'
const validToken = Cypress.env('VALID_TOKEN');

describe('Users Create - /users/create', () => {

  it('Cria usuário apenas com campos obrigatórios', () => {
    const { street_1, street_2, city, country, zipcode, ...bodyMin } = validBody;
    createUser({ ...bodyMin, profile_username: 'user' + Date.now(), email: `min${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    const { token, ...body } = validBody;
    createUser(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    createUser({ ...validBody, token: 'token_invalido', profile_username: 'user' + Date.now(), email: `inv${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    createUser({ ...validBody, token: 'token_expirado', profile_username: 'user' + Date.now(), email: `exp${Date.now()}@test.com` }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    createUser({ ...validBody, token: null, profile_username: 'user' + Date.now(), email: `null${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    createUser({ ...validBody, token: '😀🔥💥', profile_username: 'user' + Date.now(), email: `emoji${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    createUser({ ...validBody, token: "' OR 1=1 --", profile_username: 'user' + Date.now(), email: `sqli${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    createUser({ ...validBody, extra: 'foo', profile_username: 'user' + Date.now(), email: `extra${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { ...validBody, profile_username: 'user' + Date.now(), email: `ct${Date.now()}@test.com` },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    createUser({ ...validBody, token: "' OR 1=1 --", profile_username: 'user' + Date.now(), email: `sec${Date.now()}@test.com` }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    createUser({ ...validBody, profile_username: 'user' + Date.now(), email: `hdr${Date.now()}@test.com` }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      createUser({ ...validBody, profile_username: 'user' + Math.random(), email: `rl${Math.random()}@test.com` })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Falha ao criar usuário com email já existente', () => {
    const uniqueEmail = `dup${Date.now()}@test.com`;
    const uniqueUsername = 'user' + Date.now();
    createUser({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername }).then(() => {
      // Segunda tentativa com mesmo email/username
      createUser({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername }).then((response) => {
        expect([400, 409, 422]).to.include(response.status);
      });
    });
  });
});