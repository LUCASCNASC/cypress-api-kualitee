const PATH_API = '/User/UserUpdate'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Users Update - /users/update', () => {

  function updateUser(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  const validBody = {
    token: validToken,
    profile_username: 'userupdate' + Date.now(),
    first_name: 'Maria',
    last_name: 'Souza',
    email: `maria${Date.now()}@test.com`,
    street_1: 'Av. Central',
    street_2: 'Apto 202',
    city: 'São Paulo',
    country: 'Brasil',
    zipcode: 13579135,
    role: 7,
    user_id: 101 // Altere para um user_id válido no seu ambiente!
  };

  // --- POSITIVOS ---
  [7, 6, 2].forEach(role => {
    it(`Atualiza usuário com role válida (${role})`, () => {
      updateUser({ ...validBody, role, profile_username: 'updateuser' + Date.now(), email: `role${role}${Date.now()}@test.com` }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success', true);
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Atualiza usuário apenas com campos obrigatórios', () => {
    const { street_1, street_2, city, country, zipcode, ...bodyMin } = validBody;
    updateUser({ ...bodyMin, profile_username: 'updateuser' + Date.now(), email: `min${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- NEGATIVOS: Auth ---
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

  // --- Campos obrigatórios ausentes ---
  ['profile_username', 'first_name', 'last_name', 'email', 'role', 'user_id'].forEach(field => {
    it(`Falha com campo obrigatório ausente: ${field}`, () => {
      const body = { ...validBody };
      delete body[field];
      body.profile_username = 'updateuser' + Date.now(); // Garante único username
      body.email = `miss${field}${Date.now()}@test.com`;
      updateUser(body).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- role inválido ---
  [-1, 0, 1, 3, 4, 5, 8, 999, 'a', '', null, {}, [], true, false].forEach(role => {
    it(`Falha com role inválido (${JSON.stringify(role)})`, () => {
      updateUser({ ...validBody, role, profile_username: 'updateuser' + Date.now(), email: `role${role}${Date.now()}@test.com` }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- email inválido ---
  ['maria', 'maria@', '@gmail.com', 'maria.com', '', null, 123, {}, [], true, false].forEach(email => {
    it(`Falha com email inválido (${JSON.stringify(email)})`, () => {
      updateUser({ ...validBody, email, profile_username: 'updateuser' + Date.now() }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- profile_username inválido ---
  [null, '', {}, [], true, false].forEach(username => {
    it(`Falha com profile_username inválido (${JSON.stringify(username)})`, () => {
      updateUser({ ...validBody, profile_username: username, email: `user${Date.now()}@test.com` }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- user_id inválido ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(user_id => {
    it(`Falha com user_id inválido (${JSON.stringify(user_id)})`, () => {
      updateUser({ ...validBody, user_id, profile_username: 'updateuser' + Date.now(), email: `uid${Date.now()}@test.com` }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    updateUser({ ...validBody, extra: 'bar', profile_username: 'updateuser' + Date.now(), email: `extra${Date.now()}@test.com` }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  // --- Campos opcionais: limites, nulos, tipos errados ---
  ['street_1', 'street_2', 'city', 'country'].forEach(field => {
    ['', null, {}, [], 123, true, false].forEach(value => {
      it(`Aceita campo opcional ${field} com valor ${JSON.stringify(value)}`, () => {
        updateUser({ ...validBody, [field]: value, profile_username: 'updateuser' + Date.now(), email: `opt${field}${Date.now()}@test.com` }).then(response => {
          expect([200, 400, 422]).to.include(response.status);
        });
      });
    });
  });

  // --- zipcode: limites, string, vazio ---
  [null, '', '12345', 0, -1, 9999999999, {}, [], true, false].forEach(zip => {
    it(`Aceita/rejeita zipcode com valor ${JSON.stringify(zip)}`, () => {
      updateUser({ ...validBody, zipcode: zip, profile_username: 'updateuser' + Date.now(), email: `zip${Date.now()}@test.com` }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
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

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    updateUser({ ...validBody, token: "' OR 1=1 --", profile_username: 'updateuser' + Date.now(), email: `sec${Date.now()}@test.com` }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    updateUser({ ...validBody, profile_username: 'updateuser' + Date.now(), email: `hdr${Date.now()}@test.com` }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      updateUser({ ...validBody, profile_username: 'updateuser' + Math.random(), email: `rl${Math.random()}@test.com` })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade (email, username ou user_id já existente) ---
  it('Falha ao atualizar usuário com email já existente em outro usuário', () => {
    const uniqueEmail = `dup${Date.now()}@test.com`;
    const uniqueUsername = 'updateuser' + Date.now();
    // Cria com um user_id diferente, se possível, ou adapte para seu ambiente!
    updateUser({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername, user_id: validBody.user_id }).then(() => {
      // Segunda tentativa com mesmo email/username (use outro user_id)
      updateUser({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername, user_id: validBody.user_id + 1 }).then((response) => {
        expect([400, 409, 422]).to.include(response.status);
      });
    });
  });

});