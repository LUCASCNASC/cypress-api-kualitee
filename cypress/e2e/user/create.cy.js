const PATH_API = '/User/UsersCreate'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Users Create - /users/create', () => {

  function createUser(body, options = {}) {
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
    profile_username: 'user' + Date.now(),
    first_name: 'Lucas',
    last_name: 'Silva',
    email: `lucas${Date.now()}@test.com`,
    street_1: 'Rua 1',
    street_2: 'Apto 101',
    city: 'Cidade',
    country: 'Brasil',
    zipcode: 12345678,
    role: 7
  };

  // --- POSITIVOS ---
  [7, 6, 2].forEach(role => {
    it(`Cria usuário com role válida (${role})`, () => {
      createUser({ ...validBody, role, profile_username: 'user' + Date.now(), email: `user${role}${Date.now()}@test.com` }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success', true);
        // Ajuste conforme response real
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Cria usuário apenas com campos obrigatórios', () => {
    const { street_1, street_2, city, country, zipcode, ...bodyMin } = validBody;
    createUser({ ...bodyMin, profile_username: 'user' + Date.now(), email: `min${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    const { token, ...body } = validBody;
    createUser(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {
    createUser({ ...validBody, token: 'token_invalido', profile_username: 'user' + Date.now(), email: `inv${Date.now()}@test.com` }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    createUser({ ...validBody, token: 'token_expirado', profile_username: 'user' + Date.now(), email: `exp${Date.now()}@test.com` }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
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

  // --- Campos obrigatórios ausentes ---
  ['profile_username', 'first_name', 'last_name', 'email', 'role'].forEach(field => {
    it(`Falha com campo obrigatório ausente: ${field}`, () => {
      const body = { ...validBody };
      delete body[field];
      body.profile_username = 'user' + Date.now(); // Garante único username
      body.email = `miss${field}${Date.now()}@test.com`; // Garante email único
      createUser(body).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- role inválido ---
  [-1, 0, 1, 3, 4, 5, 8, 999, 'a', '', null, {}, [], true, false].forEach(role => {
    it(`Falha com role inválido (${JSON.stringify(role)})`, () => {
      createUser({ ...validBody, role, profile_username: 'user' + Date.now(), email: `role${role}${Date.now()}@test.com` }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- email inválido ---
  ['lucas', 'lucas@', '@gmail.com', 'lucas.com', '', null, 123, {}, [], true, false].forEach(email => {
    it(`Falha com email inválido (${JSON.stringify(email)})`, () => {
      createUser({ ...validBody, email, profile_username: 'user' + Date.now() }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- profile_username inválido ---
  [null, '', {}, [], true, false].forEach(username => {
    it(`Falha com profile_username inválido (${JSON.stringify(username)})`, () => {
      createUser({ ...validBody, profile_username: username, email: `user${Date.now()}@test.com` }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    createUser({ ...validBody, extra: 'foo', profile_username: 'user' + Date.now(), email: `extra${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- Campos opcionais: limites, nulos, tipos errados ---
  ['street_1', 'street_2', 'city', 'country'].forEach(field => {
    ['', null, {}, [], 123, true, false].forEach(value => {
      it(`Aceita campo opcional ${field} com valor ${JSON.stringify(value)}`, () => {
        createUser({ ...validBody, [field]: value, profile_username: 'user' + Date.now(), email: `opt${field}${Date.now()}@test.com` }).then(response => {
          expect([200, 400, 422]).to.include(response.status); // Aceita, ignora ou rejeita (depende do contrato)
        });
      });
    });
  });

  // --- zipcode: limites, string, vazio ---
  [null, '', '12345', 0, -1, 9999999999, {}, [], true, false].forEach(zip => {
    it(`Aceita/rejeita zipcode com valor ${JSON.stringify(zip)}`, () => {
      createUser({ ...validBody, zipcode: zip, profile_username: 'user' + Date.now(), email: `zip${Date.now()}@test.com` }).then(response => {
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
      body: { ...validBody, profile_username: 'user' + Date.now(), email: `ct${Date.now()}@test.com` },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    createUser({ ...validBody, token: "' OR 1=1 --", profile_username: 'user' + Date.now(), email: `sec${Date.now()}@test.com` }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    createUser({ ...validBody, profile_username: 'user' + Date.now(), email: `hdr${Date.now()}@test.com` }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      createUser({ ...validBody, profile_username: 'user' + Math.random(), email: `rl${Math.random()}@test.com` })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade ---
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