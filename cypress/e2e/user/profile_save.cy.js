const PATH_API = '/User/profile'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Users Profile Save - /users/profile_save', () => {

  const validBody = {
    profile_username: 'profileuser' + Date.now(),
    first_name: 'Lucas',
    last_name: 'Silva',
    email: `lucas${Date.now()}@test.com`,
    street_1: 'Rua A',
    street_2: 'Apto 101',
    city: 'Cidade',
    country: 'Brasil',
    zipcode: 12345678,
    role: 7
  };

  function saveProfile(body, file = null, options = {}) {
    if (file) {
      // Para upload de arquivo, usa FormData
      const formData = new FormData();
      Object.entries(body).forEach(([k, v]) => formData.append(k, v));
      formData.append('attachment', file, 'teste.txt');
      return cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        failOnStatusCode: false,
        ...options,
      });
    } else {
      return cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        form: true,
        body,
        failOnStatusCode: false,
        ...options,
      });
    }
  }

  // --- POSITIVOS ---
  [7, 6, 2].forEach(role => {
    it(`Salva perfil com role válida (${role})`, () => {
      saveProfile({ ...validBody, role, profile_username: 'profileuser' + Date.now(), email: `role${role}${Date.now()}@test.com` }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success', true);
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Salva perfil apenas com campos obrigatórios', () => {
    const { street_1, street_2, city, country, zipcode, ...bodyMin } = validBody;
    saveProfile({ ...bodyMin, profile_username: 'profileuser' + Date.now(), email: `min${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Salva perfil com attachment (arquivo)', () => {
    // Cria um arquivo Blob para teste
    const file = new Blob(['teste de upload'], { type: 'text/plain' });
    saveProfile({ ...validBody, profile_username: 'attachuser' + Date.now(), email: `file${Date.now()}@test.com` }, file).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  // --- NEGATIVOS: Campos obrigatórios ausentes ---
  ['profile_username', 'first_name', 'last_name', 'email', 'role'].forEach(field => {
    it(`Falha com campo obrigatório ausente: ${field}`, () => {
      const body = { ...validBody };
      delete body[field];
      body.profile_username = 'profileuser' + Date.now(); // username sempre único
      body.email = `miss${field}${Date.now()}@test.com`;
      saveProfile(body).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- role inválido ---
  [-1, 0, 1, 3, 4, 5, 8, 999, 'a', '', null, {}, [], true, false].forEach(role => {
    it(`Falha com role inválido (${JSON.stringify(role)})`, () => {
      saveProfile({ ...validBody, role, profile_username: 'profileuser' + Date.now(), email: `role${role}${Date.now()}@test.com` }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- email inválido ---
  ['lucas', 'lucas@', '@gmail.com', 'lucas.com', '', null, 123, {}, [], true, false].forEach(email => {
    it(`Falha com email inválido (${JSON.stringify(email)})`, () => {
      saveProfile({ ...validBody, email, profile_username: 'profileuser' + Date.now() }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- profile_username inválido ---
  [null, '', {}, [], true, false].forEach(username => {
    it(`Falha com profile_username inválido (${JSON.stringify(username)})`, () => {
      saveProfile({ ...validBody, profile_username: username, email: `profile${Date.now()}@test.com` }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    saveProfile({ ...validBody, extra: 'foo', profile_username: 'profileuser' + Date.now(), email: `extra${Date.now()}@test.com` }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- Campos opcionais: limites, nulos, tipos errados ---
  ['street_1', 'street_2', 'city', 'country'].forEach(field => {
    ['', null, {}, [], 123, true, false].forEach(value => {
      it(`Aceita campo opcional ${field} com valor ${JSON.stringify(value)}`, () => {
        saveProfile({ ...validBody, [field]: value, profile_username: 'profileuser' + Date.now(), email: `opt${field}${Date.now()}@test.com` }).then(response => {
          expect([200, 400, 422]).to.include(response.status); // Pode aceitar, ignorar ou rejeitar, depende do contrato
        });
      });
    });
  });

  // --- zipcode: limites, string, vazio ---
  [null, '', '12345', 0, -1, 9999999999, {}, [], true, false].forEach(zip => {
    it(`Aceita/rejeita zipcode com valor ${JSON.stringify(zip)})`, () => {
      saveProfile({ ...validBody, zipcode: zip, profile_username: 'profileuser' + Date.now(), email: `zip${Date.now()}@test.com` }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- attachment inválido ---
  [null, '', {}, [], true, false].forEach(val => {
    it(`Aceita/rejeita attachment inválido (${JSON.stringify(val)})`, () => {
      saveProfile({ ...validBody, profile_username: 'profileuser' + Date.now(), email: `att${Date.now()}@test.com` }, val).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { ...validBody, profile_username: 'profileuser' + Date.now(), email: `ct${Date.now()}@test.com` },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    saveProfile({ ...validBody, profile_username: "' OR 1=1 --", email: `sec${Date.now()}@test.com` }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    saveProfile({ ...validBody, profile_username: 'profileuser' + Date.now(), email: `hdr${Date.now()}@test.com` }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplos saves rápidos (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      saveProfile({ ...validBody, profile_username: 'profileuser' + Math.random(), email: `rl${Math.random()}@test.com` })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade ---
  it('Falha ao salvar perfil com email já existente', () => {
    const uniqueEmail = `dup${Date.now()}@test.com`;
    const uniqueUsername = 'profileuser' + Date.now();
    saveProfile({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername }).then(() => {
      // Segunda tentativa com mesmo email/username
      saveProfile({ ...validBody, email: uniqueEmail, profile_username: uniqueUsername }).then((response) => {
        expect([400, 409, 422]).to.include(response.status);
      });
    });
  });

});